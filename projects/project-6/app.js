const canvas = document.getElementById("c");
const video = document.getElementById("video");

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

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x, a.y-b.y);

function showErr(e){
  errBox.style.display = "block";
  errBox.textContent = String(e?.stack || e);
}
window.addEventListener("error", (e)=> showErr(e.error || e.message));
window.addEventListener("unhandledrejection", (e)=> showErr(e.reason));

function setState(txt){ stateChip.textContent = txt; }
function setToast(txt){
  toast.textContent = txt;
  toast.style.opacity = "0.95";
  clearTimeout(setToast._t);
  setToast._t = setTimeout(()=> toast.style.opacity="0.75", 1700);
}

toggleBtn.addEventListener("click", ()=>{
  hud.classList.toggle("collapsed");
  toggleBtn.textContent = hud.classList.contains("collapsed") ? "Show UI" : "Hide UI";
});
if (window.matchMedia("(max-width: 480px)").matches){
  hud.classList.add("collapsed");
  toggleBtn.textContent = "Show UI";
}

// ---------- THREE ----------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x061018, 10, 70);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 250);
camera.position.set(0, 3.8, 8.2);
camera.lookAt(0, 1.0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

scene.add(new THREE.HemisphereLight(0x99d9ff, 0x07101a, 1.25));
const dl = new THREE.DirectionalLight(0xffffff, 0.85);
dl.position.set(6, 10, 7);
scene.add(dl);

// Road
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(9, 240),
  new THREE.MeshStandardMaterial({ color: 0x071624, roughness: 1, metalness: 0 })
);
road.rotation.x = -Math.PI/2;
road.position.z = -95;
scene.add(road);

// 3 lanes
const lanes = [-1.8, 0, 1.8];

// lane separators
const laneGroup = new THREE.Group();
scene.add(laneGroup);
for(let i=0;i<80;i++){
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.01, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x0fcfff, emissive: 0x001b24, roughness: 1 })
  );
  m.position.set(0, 0.01, -i*3.0);
  laneGroup.add(m);
}

// neon rails
function rail(x){
  const r = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.06, 240),
    new THREE.MeshStandardMaterial({ color: 0x0aaad1, emissive: 0x012b3a, roughness: 1 })
  );
  r.position.set(x, 0.03, -95);
  return r;
}
scene.add(rail(-2.55));
scene.add(rail( 2.55));

// ---------- PLAYER CAR (GLB) ----------
let car = new THREE.Group();
scene.add(car);

let carModel = null;
let neon = null;

function addFallbackCar(){
  // fallback box car (if glb fails)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.35, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x0b1d2b, roughness: 0.35, metalness: 0.25 })
  );
  body.position.y = 0.35;
  car.add(body);
}

function addNeon(){
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 2.2),
    new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent:true, opacity:0.18 })
  );
  glow.rotation.x = -Math.PI/2;
  glow.position.y = 0.02;
  car.add(glow);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.25, 44),
    new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent:true, opacity:0.18 })
  );
  ring.rotation.x = -Math.PI/2;
  ring.position.y = 0.021;
  ring.position.z = -0.2;
  car.add(ring);

  neon = glow;
}

car.position.set(0, 0, 2.2);

// Load GLB (ROOT PATH ✅)
try{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(
    "./car.glb",
    (gltf)=>{
      carModel = gltf.scene;
      carModel.scale.set(1.25, 1.25, 1.25);
      carModel.position.y = 0.02;
      car.add(carModel);
      setToast("Car model loaded ✅");
    },
    undefined,
    (e)=>{
      addFallbackCar();
      setToast("GLB failed → fallback car");
      showErr(e);
    }
  );
}catch(e){
  addFallbackCar();
  showErr(e);
}
addNeon();

// ---------- TRAFFIC AI ----------
const traffic = [];
const trafficMat = new THREE.MeshStandardMaterial({ color: 0x2b0b1f, emissive: 0x12040a, roughness: 0.9 });

function spawnTraffic(z){
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 2.0), trafficMat);
  t.position.set(lanes[Math.floor(Math.random()*3)], 0.28, z);
  scene.add(t);
  traffic.push(t);
}
for(let i=0;i<7;i++) spawnTraffic(-12 - i*12);

// ---------- AUDIO (root paths ✅) ----------
const audio = {
  engine: new Audio("./engine.mp3"),
  drift:  new Audio("./drift.mp3"),
  crash:  new Audio("./crash.mp3")
};
audio.engine.loop = true;
audio.engine.volume = 0.45;
audio.drift.loop = true;
audio.drift.volume = 0.30;
audio.crash.volume = 0.90;

function tryPlay(a){
  a.currentTime = 0;
  const p = a.play();
  if(p && p.catch) p.catch(()=>{ /* user gesture required */ });
}

// ---------- GAME STATE ----------
let running = false;
let gameOver = false;

let speed = 0;
let targetSpeed = 0;
let score = 0;
let level = 1;

let steerTarget = 0;
let steer = 0;

let driftOn = false;
let driftStrength = 0;

const laneLimit = 1.8;

// ---------- HAND TRACKING ----------
let hands = null;
let stream = null;
let rafId = null;

function palmSize(hand){
  return dist(hand[0], hand[9]) + 1e-6;
}
function isOpenPalm(hand, size){
  const idx = hand[8].y < hand[6].y;
  const mid = hand[12].y < hand[10].y;
  const ring = hand[16].y < hand[14].y;
  const pin = hand[20].y < hand[18].y;
  return [idx,mid,ring,pin].filter(Boolean).length >= 3;
}
function isFist(hand){
  const palm = hand[9];
  const tips = [8,12,16,20];
  const avg = tips.reduce((s,i)=> s + dist(hand[i], palm), 0) / tips.length;
  return avg < 0.18; // normalized-ish on mediapipe coords
}
function isPinch(hand, size){
  const d = Math.hypot(hand[4].x - hand[8].x, hand[4].y - hand[8].y);
  return d < size * 0.45; // mobile-friendly threshold
}

function setupHands(){
  hands = new Hands({ locateFile:(f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });
  hands.onResults(onHands);
}

let lastHandsAt = 0;

function onHands(res){
  if(!res?.multiHandLandmarks?.length){
    steerTarget *= 0.94;
    targetSpeed = lerp(targetSpeed, 0, 0.04);
    driftOn = false;
    return;
  }

  lastHandsAt = performance.now();

  // We’ll use: Left hand = steer, Right hand = speed/drift
  const lm = res.multiHandLandmarks;
  const hd = res.multiHandedness || [];

  let left = null, right = null;

  for(let i=0;i<lm.length;i++){
    const label = hd[i]?.label; // "Left"/"Right"
    if(label === "Left") left = lm[i];
    if(label === "Right") right = lm[i];
  }
  if(!left) left = lm[0];
  if(!right && lm.length > 1) right = lm[1];

  if(left){
    const palm = left[9];
    steerTarget = clamp((palm.x - 0.5) * 2.3, -1, 1);
  }

  if(right){
    const size = palmSize(right);
    const open = isOpenPalm(right, size);
    const fist = isFist(right);
    const pinch = isPinch(right, size);

    // speed logic
    if(open){
      targetSpeed = 18 + level * 2.2; // level boosts speed
      setState("Accelerating ✋");
    } else if(fist){
      targetSpeed = 0;
      setState("Braking ✊");
    } else {
      targetSpeed = lerp(targetSpeed, (10 + level*1.2), 0.06);
      setState("Cruise");
    }

    // drift hold
    driftOn = pinch;
  }
}

// ---------- CAMERA START/STOP ----------
async function startCamera(){
  try{
    if(!hands) setupHands();

    setState("Requesting camera…");
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode:"user", width:{ideal:640}, height:{ideal:480} },
      audio:false
    });

    video.srcObject = stream;
    await video.play();

    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;

    // audio must start from user click ✅
    tryPlay(audio.engine);

    const loop = async()=>{
      if(!running) return;
      try { await hands.send({ image: video }); } catch(e){}
      rafId = requestAnimationFrame(loop);
    };
    loop();

    setState("Camera ON ✅");
    setToast("Show hands to drive 🚗");
  } catch(e){
    setState("Camera blocked/denied");
    setToast("Chrome → Site settings → Camera → Allow");
    showErr(e);
  }
}

function stopCamera(){
  running = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;

  if(rafId) cancelAnimationFrame(rafId);
  rafId = null;

  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream = null;
  }
  video.srcObject = null;

  audio.engine.pause();
  audio.drift.pause();

  setState("Camera OFF");
  setToast("Stopped");
}

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);

// ---------- GAME LOOP ----------
let lastT = performance.now();

function resetGame(){
  gameOver = false;
  score = 0;
  level = 1;
  speed = 0;
  targetSpeed = 0;
  steer = 0;
  car.position.x = 0;

  traffic.forEach((t, idx)=>{
    t.position.z = -12 - idx*12;
    t.position.x = lanes[Math.floor(Math.random()*3)];
  });

  setToast("Go! ✋ accelerate");
}

function collide(){
  for(const t of traffic){
    const dz = Math.abs(t.position.z - car.position.z);
    const dx = Math.abs(t.position.x - car.position.x);
    if(dz < 1.3 && dx < 0.9) return true;
  }
  return false;
}

function animate(){
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = clamp((now - lastT)/1000, 0, 0.035);
  lastT = now;

  // smooth steer
  steer = lerp(steer, steerTarget, 0.12);

  // drift
  driftStrength = lerp(driftStrength, driftOn ? 1 : 0, 0.10);

  // speed
  speed = lerp(speed, targetSpeed, 0.08);

  // apply drift handling: wider slide
  let xTarget = steer * laneLimit;
  if(driftStrength > 0.2){
    xTarget += steer * 0.45; // extra slide feel
    if(audio.drift.paused) tryPlay(audio.drift);
  } else {
    audio.drift.pause();
  }

  car.position.x = lerp(car.position.x, xTarget, 0.16);
  car.position.x = clamp(car.position.x, -2.1, 2.1);

  // tilt
  car.rotation.z = lerp(car.rotation.z, (-steer * 0.18) - (steer * 0.22 * driftStrength), 0.12);

  // neon intensity
  if(neon) neon.material.opacity = 0.14 + 0.10 * driftStrength;

  // move lane marks
  laneGroup.children.forEach(line=>{
    line.position.z += speed * dt * 2.4;
    if(line.position.z > 6) line.position.z = -230;
  });

  // traffic AI (more speed + more density with level)
  if(!gameOver){
    traffic.forEach(t=>{
      t.position.z += speed * dt * (2.6 + level*0.05);
      if(t.position.z > 7){
        t.position.z = - (50 + Math.random()*70);
        // basic AI: avoid player lane sometimes
        const avoid = Math.random() < 0.35;
        const lane = avoid ? (car.position.x < 0 ? 2 : 0) : Math.floor(Math.random()*3);
        t.position.x = lanes[lane];
        score += 8;
      }
    });

    // levels
    if(score > level * 160){
      level++;
      setToast(`Level Up 🔥 (${level})`);
    }

    // collision
    if(collide()){
      gameOver = true;
      targetSpeed = 0;
      audio.engine.pause();
      audio.drift.pause();
      tryPlay(audio.crash);
      setState("CRASH 💥 Tap to restart");
      setToast("Crash! Tap screen to restart");
    }
  } else {
    targetSpeed = 0;
  }

  // UI
  spdEl.textContent = String(Math.round(speed));
  lvlEl.textContent = String(level);
  scrEl.textContent = String(score);

  // hint if no hands
  if(startBtn.disabled && (now - lastHandsAt) > 1200){
    setState("No hands detected 👋");
  }

  // camera follow
  camera.position.x = lerp(camera.position.x, car.position.x * 0.12, 0.08);

  renderer.render(scene, camera);
}
animate();

addEventListener("pointerdown", ()=>{
  if(gameOver){
    resetGame();
    // restart engine after user click
    tryPlay(audio.engine);
    setState("Running ✅");
  }
});

// resize
addEventListener("resize", ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// init
setState("Ready");
setToast("Enable Camera to start");
