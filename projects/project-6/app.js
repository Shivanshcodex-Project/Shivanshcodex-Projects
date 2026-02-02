import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

// ---------- UI ----------
const canvas = document.getElementById("c");
const video = document.getElementById("video");
const minimap = document.getElementById("minimap");
const mm = minimap.getContext("2d");

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const toggleBtn = document.getElementById("toggleBtn");
const hud = document.getElementById("hud");
const toast = document.getElementById("toast");
const errBox = document.getElementById("err");
const stateChip = document.getElementById("stateChip");

const spdEl = document.getElementById("spd");
const lvlEl = document.getElementById("lvl");
const scrEl = document.getElementById("scr");
const nitEl = document.getElementById("nit");

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

function setState(t){ stateChip.textContent = t; }
function setToast(t){
  toast.textContent=t; toast.style.opacity="0.95";
  clearTimeout(setToast._t);
  setToast._t=setTimeout(()=>toast.style.opacity="0.75",1600);
}
function showErr(e){
  errBox.style.display="block";
  errBox.textContent = String(e?.stack||e);
}
window.addEventListener("error", (e)=> showErr(e.error||e.message));
window.addEventListener("unhandledrejection", (e)=> showErr(e.reason));

toggleBtn.onclick=()=>{
  hud.classList.toggle("collapsed");
  toggleBtn.textContent = hud.classList.contains("collapsed") ? "Show UI" : "Hide UI";
};

// ---------- THREE ----------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x061018, 12, 120);

const camera = new THREE.PerspectiveCamera(62, innerWidth/innerHeight, 0.1, 500);
camera.position.set(0, 4.2, 9.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));

scene.add(new THREE.HemisphereLight(0x9adfff,0x07101a,1.25));
const dl = new THREE.DirectionalLight(0xffffff,0.9);
dl.position.set(6,12,8);
scene.add(dl);

// ---------- TRACK (curved) ----------
const TRACK_W = 8.0;
const lanes = [-1.8, 0, 1.8]; // lane offsets
let curve = 0;         // current curve
let curveTarget = 0;   // where road is turning
let roadOffset = 0;    // lateral offset accumulated

// Road segments (recycle)
const segs=[];
const SEG_LEN=12;
const SEG_COUNT=22;

function makeRoadSeg(){
  const g = new THREE.PlaneGeometry(TRACK_W, SEG_LEN);
  const m = new THREE.MeshStandardMaterial({ color:0x071624, roughness:1 });
  const p = new THREE.Mesh(g,m);
  p.rotation.x=-Math.PI/2;
  p.position.y=0;
  scene.add(p);

  // lane lines
  const lineMat = new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.55 });
  const lG = new THREE.PlaneGeometry(0.15, SEG_LEN);
  const l1 = new THREE.Mesh(lG,lineMat);
  l1.rotation.x=-Math.PI/2; l1.position.y=0.01;
  const l2 = l1.clone();
  l1.position.x = -TRACK_W/6;
  l2.position.x =  TRACK_W/6;
  p.add(l1,l2);

  return p;
}
for(let i=0;i<SEG_COUNT;i++){
  const s = makeRoadSeg();
  s.position.z = -i*SEG_LEN;
  segs.push(s);
}

// Rails
const railMat = new THREE.MeshStandardMaterial({ color:0x0aaad1, emissive:0x012b3a, roughness:1 });
const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.08,SEG_COUNT*SEG_LEN), railMat);
leftRail.position.set(-TRACK_W/2-0.2,0.04,-(SEG_COUNT*SEG_LEN)/2);
scene.add(leftRail);
const rightRail = leftRail.clone();
rightRail.position.x = TRACK_W/2+0.2;
scene.add(rightRail);

// ---------- PLAYER CAR (always visible) ----------
const car = new THREE.Group();
scene.add(car);
car.position.set(0,0,4.0);

function buildFallbackCar(){
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.38, 2.0),
    new THREE.MeshStandardMaterial({ color:0x0b1d2b, roughness:0.35, metalness:0.3 })
  );
  body.position.y=0.35;

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.25, 0.9),
    new THREE.MeshStandardMaterial({ color:0x071624, roughness:0.35, metalness:0.15 })
  );
  top.position.set(0,0.58,-0.1);

  const neon = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.32, 48),
    new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.20 })
  );
  neon.rotation.x=-Math.PI/2;
  neon.position.y=0.021;

  car.add(body, top, neon);
  return neon;
}

let neon = buildFallbackCar();

// GLB load (optional)
try{
  const gltf = new GLTFLoader();
  gltf.load("./car.glb", (g)=>{
    car.clear();
    const model = g.scene;
    model.scale.set(1.35,1.35,1.35);
    model.position.y=0.02;
    car.add(model);
    neon = buildFallbackCar(); // keep neon even on model
    setToast("Car GLB loaded ✅");
  }, undefined, (e)=>{
    setToast("GLB failed → fallback car");
  });
}catch(e){
  // fallback already exists
}

// ---------- TRAFFIC ----------
const traffic=[];
const tMat = new THREE.MeshStandardMaterial({ color:0x3c0d22, emissive:0x12040a, roughness:0.95 });
function spawnTraffic(z){
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.0,0.55,2.0), tMat);
  t.position.set(lanes[Math.floor(Math.random()*3)],0.28,z);
  scene.add(t);
  traffic.push(t);
}
for(let i=0;i<9;i++) spawnTraffic(-20 - i*10);

// ---------- AUDIO (optional) ----------
const engine = new Audio("./engine.mp3"); engine.loop=true; engine.volume=0.45;
const driftS = new Audio("./drift.mp3");  driftS.loop=true; driftS.volume=0.3;
const crashS = new Audio("./crash.mp3");  crashS.volume=0.9;
const tryPlay=(a)=>{ try{ a.currentTime=0; const p=a.play(); p?.catch?.(()=>{});}catch{} };

// ---------- GAME ----------
let running=false;
let speed=0, targetSpeed=0;
let score=0, level=1;
let steer=0, steerTarget=0;
let driftOn=false;
let nitro=100, nitroOn=false;
let lastHandsAt=0;

// Better camera
let camX=0, camZ=9.5;

// ---------- HAND TRACKING ----------
let hands=null, stream=null, camUtil=null;

function setupHands(){
  hands = new Hands({ locateFile:(f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
  hands.setOptions({maxNumHands:2, modelComplexity:1, minDetectionConfidence:0.7, minTrackingConfidence:0.7});
  hands.onResults(onHands);
}
function palmSize(h){
  const a=h[0], b=h[9];
  return Math.hypot(a.x-b.x, a.y-b.y)+1e-6;
}
function isOpenPalm(h, size){
  const up = (tip,pip)=> h[tip].y < h[pip].y;
  const cnt = [up(8,6),up(12,10),up(16,14),up(20,18)].filter(Boolean).length;
  return cnt>=3;
}
function isFist(h){
  const palm=h[9];
  const tips=[8,12,16,20];
  const avg=tips.reduce((s,i)=> s + Math.hypot(h[i].x-palm.x, h[i].y-palm.y), 0)/tips.length;
  return avg < 0.18;
}
function isPinch(h, size){
  const d = Math.hypot(h[4].x-h[8].x, h[4].y-h[8].y);
  return d < size * 0.45;
}
function isThumbUp(h){
  // simple thumb-up detection (nitro)
  return h[4].y < h[3].y && h[3].y < h[2].y;
}

function onHands(res){
  if(!res?.multiHandLandmarks?.length){
    steerTarget *= 0.94;
    targetSpeed = lerp(targetSpeed, 8 + level*1.0, 0.04);
    driftOn=false; nitroOn=false;
    return;
  }

  lastHandsAt = performance.now();

  const lm = res.multiHandLandmarks;
  const hd = res.multiHandedness || [];
  let left=null, right=null;

  for(let i=0;i<lm.length;i++){
    const label = hd[i]?.label;
    if(label==="Left") left=lm[i];
    if(label==="Right") right=lm[i];
  }
  if(!left) left = lm[0];
  if(!right && lm.length>1) right=lm[1];

  if(left){
    const palm = left[9];
    steerTarget = clamp((palm.x-0.5)*2.4, -1, 1);
  }

  if(right){
    const size = palmSize(right);
    const open = isOpenPalm(right,size);
    const fist = isFist(right);
    const pinch = isPinch(right,size);
    const thumb = isThumbUp(right);

    if(open){ targetSpeed = 20 + level*2.2; setState("Accelerating ✋"); }
    else if(fist){ targetSpeed = 0; setState("Braking ✊"); }
    else { targetSpeed = lerp(targetSpeed, 12 + level*1.2, 0.06); setState("Cruise"); }

    driftOn = pinch;
    nitroOn = thumb;
  }
}

// ---------- START / STOP ----------
startBtn.onclick = async()=>{
  try{
    if(!hands) setupHands();
    setState("Requesting camera…");

    stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:"user", width:{ideal:640}, height:{ideal:480} }, audio:false
    });
    video.srcObject = stream;
    await video.play();

    camUtil = new Camera(video,{ onFrame: async()=>{ await hands.send({image:video}); }});
    camUtil.start();

    running=true;
    startBtn.disabled=true;
    stopBtn.disabled=false;

    tryPlay(engine);
    setState("Running ✅");
    setToast("Drive with hands 🚗");
  }catch(e){
    setState("Camera blocked");
    setToast("Chrome → Site settings → Camera → Allow");
    showErr(e);
  }
};

stopBtn.onclick=()=>{
  running=false;
  startBtn.disabled=false;
  stopBtn.disabled=true;

  camUtil?.stop?.();
  stream?.getTracks?.().forEach(t=>t.stop());
  video.srcObject=null;

  engine.pause(); driftS.pause();
  setState("Stopped");
  setToast("Stopped");
};

// ---------- COLLISION ----------
function hitTraffic(){
  for(const t of traffic){
    const dz = Math.abs(t.position.z - car.position.z);
    const dx = Math.abs(t.position.x - car.position.x);
    if(dz < 1.25 && dx < 0.95) return true;
  }
  return false;
}

// ---------- MINIMAP ----------
function drawMinimap(){
  const w=minimap.width = minimap.clientWidth * devicePixelRatio;
  const h=minimap.height = minimap.clientHeight * devicePixelRatio;

  mm.clearRect(0,0,w,h);
  mm.fillStyle="rgba(0,0,0,0.22)";
  mm.fillRect(0,0,w,h);

  // road
  mm.strokeStyle="rgba(0,212,255,0.7)";
  mm.lineWidth=2*devicePixelRatio;
  mm.strokeRect(w*0.18,h*0.12,w*0.64,h*0.76);

  // player
  mm.fillStyle="rgba(0,212,255,0.9)";
  mm.fillRect(w*0.49,h*0.72,w*0.02,h*0.06);

  // traffic dots
  mm.fillStyle="rgba(255,80,130,0.85)";
  traffic.forEach(t=>{
    const nz = clamp((-t.position.z)/120, 0, 1);
    const lx = (t.position.x/ (TRACK_W/2)) * 0.32;
    mm.fillRect(w*(0.5+lx)-3, h*(0.12 + nz*0.76)-3, 6, 6);
  });
}

// ---------- LOOP ----------
let gameOver=false;
function crash(){
  gameOver=true;
  targetSpeed=0;
  engine.pause(); driftS.pause();
  tryPlay(crashS);
  setState("CRASH 💥 Tap to restart");
  setToast("Crash! Tap to restart");
}

function reset(){
  gameOver=false;
  score=0; level=1; nitro=100;
  speed=0; targetSpeed=0;
  steer=0; steerTarget=0;
  roadOffset=0; curve=0; curveTarget=0;
  traffic.forEach((t,i)=>{
    t.position.z = -20 - i*10;
    t.position.x = lanes[Math.floor(Math.random()*3)];
  });
  tryPlay(engine);
  setState("Running ✅");
  setToast("Go! ✋ accelerate");
}

window.addEventListener("pointerdown", ()=>{
  if(gameOver) reset();
});

let lastT=performance.now();
function animate(){
  requestAnimationFrame(animate);
  const now=performance.now();
  const dt=clamp((now-lastT)/1000, 0, 0.033);
  lastT=now;

  // curve change over time (map turns)
  if(!gameOver){
    if(Math.random() < 0.01) curveTarget = (Math.random()*2-1) * 0.8; // random turn
    curve = lerp(curve, curveTarget, 0.01);
    roadOffset += curve * speed * dt * 0.22;
    roadOffset = clamp(roadOffset, -1.6, 1.6);
  }

  // smooth steering
  steer = lerp(steer, steerTarget, 0.12);

  // speed + nitro
  let nitroBoost = 0;
  if(nitroOn && nitro>0 && !gameOver){
    nitroBoost = 10;
    nitro = Math.max(0, nitro - 30*dt);
  }else{
    nitro = Math.min(100, nitro + 12*dt);
  }

  if(!gameOver){
    speed = lerp(speed, targetSpeed + nitroBoost, 0.08);
  }else{
    speed = lerp(speed, 0, 0.08);
  }

  // drift (pinch hold)
  const driftStrength = driftOn ? 1 : 0;
  if(driftStrength>0.2){
    if(driftS.paused) tryPlay(driftS);
  }else{
    driftS.pause();
  }

  // player position: steering + road curve offset
  const xTarget = steer*2.05 + roadOffset*1.4 + (driftOn ? steer*0.55 : 0);
  car.position.x = lerp(car.position.x, clamp(xTarget, -2.3, 2.3), 0.16);
  car.rotation.z = lerp(car.rotation.z, -steer*0.22 - (driftOn ? steer*0.28 : 0), 0.12);

  // camera follow (more game feel)
  camX = lerp(camX, car.position.x*0.14 + roadOffset*0.35, 0.06);
  camera.position.x = camX;
  camera.position.y = lerp(camera.position.y, 4.2, 0.03);
  camZ = lerp(camZ, 9.5, 0.03);
  camera.position.z = camZ;
  camera.lookAt(car.position.x*0.12, 1.2, -6);

  // move road segments forward and apply curve offset
  segs.forEach(s=>{
    s.position.z += speed*dt*2.7;
    if(s.position.z > 8){
      s.position.z -= SEG_COUNT*SEG_LEN;
    }
    s.position.x = roadOffset; // road turning feel
  });
  leftRail.position.x = -TRACK_W/2-0.2 + roadOffset;
  rightRail.position.x = TRACK_W/2+0.2 + roadOffset;

  // traffic AI
  if(!gameOver){
    traffic.forEach(t=>{
      t.position.z += speed*dt*2.7;
      t.position.x += (roadOffset - t.position.x)*0.02; // follow curve slightly

      if(t.position.z > 10){
        t.position.z = -(40 + Math.random()*80);
        const avoid = Math.random()<0.35;
        const lane = avoid ? (car.position.x < 0 ? 2 : 0) : Math.floor(Math.random()*3);
        t.position.x = lanes[lane] + roadOffset;
        score += 10;
      }
    });

    // level up
    if(score > level*220){
      level++;
      setToast(`Level Up 🔥 ${level}`);
    }

    // collision
    if(hitTraffic()) crash();
  }

  // UI
  spdEl.textContent = String(Math.round(speed));
  lvlEl.textContent = String(level);
  scrEl.textContent = String(score);
  nitEl.textContent = String(Math.round(nitro));

  // hint if no hands
  if(startBtn.disabled && (now-lastHandsAt)>1200 && !gameOver){
    setState("No hands detected 👋");
  }

  drawMinimap();
  renderer.render(scene, camera);
}
animate();

addEventListener("resize", ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

setState("Ready");
setToast("Enable Camera to start");
