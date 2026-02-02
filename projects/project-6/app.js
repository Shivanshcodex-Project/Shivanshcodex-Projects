const canvas = document.getElementById("c");
const mini = document.getElementById("minimap");
const mctx = mini.getContext("2d");

const spdEl = document.getElementById("spd");
const scrEl = document.getElementById("scr");
const drEl  = document.getElementById("dr");
const modePill = document.getElementById("modePill");

const resetBtn = document.getElementById("reset");
const toggleCamBtn = document.getElementById("toggleCam");
const enableCamBtn = document.getElementById("enableCam");
const hideUIBtn = document.getElementById("hideUI");
const touchUI = document.getElementById("touchUI");

const joy = document.getElementById("joy");
const knob = document.getElementById("knob");
const accelBtn = document.getElementById("accel");
const brakeBtn = document.getElementById("brake");

// ---------- THREE SETUP ----------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050914, 18, 140);

const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 400);
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x050914, 1);

// lights
scene.add(new THREE.HemisphereLight(0xa6ddff, 0x050914, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(20, 30, 10);
scene.add(sun);

const glowLight = new THREE.PointLight(0x00d4ff, 1.2, 40, 2);
glowLight.position.set(0, 6, 0);
scene.add(glowLight);

// ---------- WORLD ----------
const WORLD = 180;

// ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(WORLD, WORLD),
  new THREE.MeshStandardMaterial({ color:0x071225, roughness:1 })
);
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.02;
scene.add(ground);

// ---------- GTA-ish Road (Curved Loop) ----------
/**
 * Curved “city road loop” (GTA vibe) using CatmullRom curve.
 * Road = ribbon geometry along curve.
 */
const roadPoints = [
  new THREE.Vector3(-60,0, 50),
  new THREE.Vector3(-20,0, 70),
  new THREE.Vector3( 40,0, 65),
  new THREE.Vector3( 70,0, 20),
  new THREE.Vector3( 60,0,-40),
  new THREE.Vector3( 15,0,-70),
  new THREE.Vector3(-45,0,-60),
  new THREE.Vector3(-75,0,-10),
  new THREE.Vector3(-60,0, 50),
];

const roadCurve = new THREE.CatmullRomCurve3(roadPoints, true, "catmullrom", 0.6);

const ROAD_W = 12;
const ROAD_SEG = 700;

function makeRoadRibbon(curve, width, segments){
  const pts = curve.getPoints(segments);
  const geo = new THREE.BufferGeometry();

  const vertices = [];
  const uvs = [];
  const indices = [];

  for(let i=0;i<pts.length;i++){
    const p = pts[i];
    const t = curve.getTangent(i/(pts.length-1)).normalize();

    // perpendicular (x,z) on ground
    const n = new THREE.Vector3(-t.z, 0, t.x).normalize();

    const left  = new THREE.Vector3(p.x, 0.01, p.z).addScaledVector(n, -width/2);
    const right = new THREE.Vector3(p.x, 0.01, p.z).addScaledVector(n,  width/2);

    vertices.push(left.x, left.y, left.z);
    vertices.push(right.x, right.y, right.z);

    const v = i/(pts.length-1);
    uvs.push(0, v);
    uvs.push(1, v);

    if(i < pts.length-1){
      const a = i*2;
      const b = i*2+1;
      const c = i*2+2;
      const d = i*2+3;
      indices.push(a,b,c, b,d,c);
    }
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const roadMat = new THREE.MeshStandardMaterial({ color:0x141414, roughness:0.95 });
const road = new THREE.Mesh(makeRoadRibbon(roadCurve, ROAD_W, ROAD_SEG), roadMat);
scene.add(road);

// lane center glow (thin ribbon)
const lane = new THREE.Mesh(makeRoadRibbon(roadCurve, 0.55, ROAD_SEG), new THREE.MeshBasicMaterial({
  color:0x00d4ff, transparent:true, opacity:0.45
}));
lane.position.y = 0.01;
scene.add(lane);

// side glow ribbons
const edgeL = new THREE.Mesh(makeRoadRibbon(roadCurve, ROAD_W-0.2, ROAD_SEG), new THREE.MeshBasicMaterial({
  color:0x00d4ff, transparent:true, opacity:0.09
}));
edgeL.position.y = 0.008;
scene.add(edgeL);

// buildings around road
function rand(a,b){ return a + Math.random()*(b-a); }
function addBuilding(x,z,w,d,h,color){
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness:0.55, metalness:0.08 })
  );
  m.position.set(x, h/2, z);
  scene.add(m);
}

for(let i=0;i<120;i++){
  const x = rand(-WORLD/2+8, WORLD/2-8);
  const z = rand(-WORLD/2+8, WORLD/2-8);

  // keep buildings away from road by sampling nearest curve point
  const t = Math.random();
  const p = roadCurve.getPoint(t);
  const dist = Math.hypot(x - p.x, z - p.z);
  if(dist < 16) continue;

  addBuilding(
    x, z,
    rand(3,9),
    rand(3,9),
    rand(5,22),
    new THREE.Color().setHSL(0.55 + Math.random()*0.12, 0.5, 0.45)
  );
}

// ---------- CAR ----------
const car = new THREE.Group();

// body + cabin (simple premium)
const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.55, 0.55, 2.6),
  new THREE.MeshStandardMaterial({ color:0x0aa6ff, metalness:0.3, roughness:0.22 })
);
body.position.y = 0.38;
car.add(body);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.12, 0.48, 1.15),
  new THREE.MeshStandardMaterial({ color:0x0b1020, metalness:0.1, roughness:0.2 })
);
cabin.position.set(0, 0.74, -0.1);
car.add(cabin);

// underglow
const glow = new THREE.Mesh(
  new THREE.BoxGeometry(1.75, 0.08, 2.85),
  new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.35 })
);
glow.position.y = 0.08;
car.add(glow);

// wheels + neon rings
function wheel(x,z){
  const w = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28,0.28,0.22,18),
    new THREE.MeshStandardMaterial({ color:0x111111, roughness:0.9 })
  );
  w.rotation.z = Math.PI/2;
  w.position.set(x, 0.22, z);
  car.add(w);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.06, 10, 22),
    new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.75 })
  );
  ring.position.copy(w.position);
  ring.rotation.y = Math.PI/2;
  car.add(ring);
}
wheel(-0.7, 0.9); wheel(0.7, 0.9);
wheel(-0.7,-0.9); wheel(0.7,-0.9);

scene.add(car);

// ---------- Touch Controls (backup) ----------
let joyActive = false;
let joyStart = {x:0,y:0};
let joyVec = {x:0,y:0}; // x for steer

function setKnob(px,py){
  knob.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
}

joy.addEventListener("pointerdown",(e)=>{
  joyActive = true;
  joy.setPointerCapture(e.pointerId);
  joyStart = {x:e.clientX, y:e.clientY};
});
joy.addEventListener("pointermove",(e)=>{
  if(!joyActive) return;
  const dx = e.clientX - joyStart.x;
  const dy = e.clientY - joyStart.y;
  const max = 38;
  const clx = Math.max(-max, Math.min(max, dx));
  const cly = Math.max(-max, Math.min(max, dy));
  joyVec.x = clx/max;
  joyVec.y = cly/max;
  setKnob(clx,cly);
});
function endJoy(){
  joyActive=false;
  joyVec.x=0; joyVec.y=0;
  setKnob(0,0);
}
joy.addEventListener("pointerup", endJoy);
joy.addEventListener("pointercancel", endJoy);

let accelHold=false, brakeHold=false;
accelBtn.addEventListener("pointerdown",()=>accelHold=true);
accelBtn.addEventListener("pointerup",()=>accelHold=false);
accelBtn.addEventListener("pointercancel",()=>accelHold=false);

brakeBtn.addEventListener("pointerdown",()=>brakeHold=true);
brakeBtn.addEventListener("pointerup",()=>brakeHold=false);
brakeBtn.addEventListener("pointercancel",()=>brakeHold=false);

// ---------- Hand Control (MediaPipe) ----------
let useHands = false;
let handsReady = false;

let handSteer = 0;     // -1..1
let handAccel = 0;     // 0..1
let handBrake = 0;     // 0..1
let handDrift = false; // pinch hold

function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

// helper: distance between landmarks
function dist(a,b){
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

// gesture helpers
function isFist(lm){
  // if finger tips are close to palm => fist
  const palm = lm[0];
  const tips = [lm[8], lm[12], lm[16], lm[20]];
  const avg = tips.reduce((s,t)=> s+dist(palm,t),0)/tips.length;
  return avg < 0.25;
}
function isOpenPalm(lm){
  const palm = lm[0];
  const tips = [lm[8], lm[12], lm[16], lm[20]];
  const avg = tips.reduce((s,t)=> s+dist(palm,t),0)/tips.length;
  return avg > 0.40;
}
function pinchAmount(lm){
  // thumb tip (4) & index tip (8)
  const d = dist(lm[4], lm[8]);
  // smaller d => stronger pinch
  // normalize: 0.02..0.18 range
  return clamp((0.18 - d) / (0.18 - 0.02), 0, 1);
}

let hands, cam;
let videoEl;

// create hidden video for camera stream
function ensureVideo(){
  if(videoEl) return;
  videoEl = document.createElement("video");
  videoEl.style.position="fixed";
  videoEl.style.left="-9999px";
  videoEl.style.top="-9999px";
  videoEl.playsInline = true;
  document.body.appendChild(videoEl);
}

async function startHands(){
  ensureVideo();

  hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.65
  });

  hands.onResults(onHandResults);

  cam = new Camera(videoEl, {
    onFrame: async () => {
      await hands.send({ image: videoEl });
    },
    width: 640,
    height: 480
  });

  await cam.start();
  handsReady = true;
  useHands = true;
  modePill.textContent = "Mode: Hand";
  // optional: hide touch UI when hand mode
  // touchUI.classList.add("hidden");
}

function stopHands(){
  useHands = false;
  handsReady = false;
  handSteer = 0; handAccel=0; handBrake=0; handDrift=false;
  modePill.textContent = "Mode: Touch";
  // touchUI.classList.remove("hidden");
}

function onHandResults(res){
  if(!useHands) return;

  // default no input
  let left = null, right = null;

  if(res.multiHandLandmarks && res.multiHandLandmarks.length){
    // use handedness to map left/right
    const handed = res.multiHandedness || [];
    for(let i=0;i<res.multiHandLandmarks.length;i++){
      const lm = res.multiHandLandmarks[i];
      const label = handed[i]?.label || "";
      if(label === "Left") left = lm;
      else if(label === "Right") right = lm;
      else {
        // fallback: first left then right
        if(!left) left = lm; else right = lm;
      }
    }
  }

  // steering from left hand X
  if(left){
    const cx = left[0].x; // 0..1
    const steer = (cx - 0.5) * 2; // -1..1
    handSteer = clamp(steer, -1, 1);
  } else {
    handSteer *= 0.9;
  }

  // accel/brake from right hand
  if(right){
    const fist = isFist(right);
    const open = isOpenPalm(right);

    const pinch = pinchAmount(right);
    handDrift = pinch > 0.75; // pinch hold => drift

    handAccel = open ? 1 : 0;
    handBrake = fist ? 1 : 0;

    // if pinch drift => also brake slightly (drift feel)
    if(handDrift) handBrake = Math.max(handBrake, 0.6);
  } else {
    handAccel *= 0.85;
    handBrake *= 0.85;
    handDrift = false;
  }
}

// UI buttons
enableCamBtn.addEventListener("click", async ()=>{
  try{
    await startHands();
    enableCamBtn.textContent = "Camera ON";
    enableCamBtn.disabled = true;
  }catch(err){
    alert("Camera start failed. Chrome > Site settings > Camera > Allow");
    console.error(err);
  }
});

// ---------- Camera Modes ----------
let camMode = "follow"; // follow / chase
toggleCamBtn.addEventListener("click", ()=>{
  camMode = (camMode==="follow") ? "chase" : "follow";
  toggleCamBtn.textContent = `Cam: ${camMode==="follow" ? "Follow" : "Chase"}`;
});

hideUIBtn.addEventListener("click", ()=>{
  document.querySelector(".hud").classList.toggle("hidden");
});

// ---------- Car state ----------
let tOnRoad = 0.02;       // curve param
let pos = new THREE.Vector3();
let yaw = 0;
let v = 0;
let score = 0;

resetBtn.addEventListener("click", resetGame);

function resetGame(){
  tOnRoad = 0.02;
  v = 0;
  score = 0;
  // place on road
  const p = roadCurve.getPointAt(tOnRoad);
  const tan = roadCurve.getTangentAt(tOnRoad).normalize();
  pos.set(p.x, 0, p.z);
  yaw = Math.atan2(tan.x, tan.z);
}

// init spawn
resetGame();

// ---------- Road-follow driving with free turning ----------
/**
 * GTA feel = road turns visible. We keep car generally on road loop.
 * Steering changes “lane offset” + small drift slip.
 */
let laneOffset = 0;  // -1..1
let steer = 0;
let driftSlip = 0;

const clock = new THREE.Clock();

function updateCamera(){
  glowLight.position.set(pos.x, 6, pos.z);

  if(camMode==="follow"){
    const back = new THREE.Vector3(Math.sin(yaw)*-7, 5.4, Math.cos(yaw)*-7);
    const target = pos.clone().add(back);
    camera.position.lerp(target, 0.12);
    camera.lookAt(pos.x, 1.2, pos.z);
  } else {
    const back = new THREE.Vector3(Math.sin(yaw)*-5.0, 3.2, Math.cos(yaw)*-5.0);
    const target = pos.clone().add(back);
    camera.position.lerp(target, 0.12);
    const look = pos.clone().add(new THREE.Vector3(Math.sin(yaw)*6, 1.1, Math.cos(yaw)*6));
    camera.lookAt(look);
  }
}

// minimap draw curved road
function drawMini(){
  const w = mini.width = mini.clientWidth * devicePixelRatio;
  const h = mini.height = mini.clientHeight * devicePixelRatio;

  mctx.clearRect(0,0,w,h);
  mctx.fillStyle = "rgba(0,0,0,.35)";
  mctx.fillRect(0,0,w,h);

  const scale = w / WORLD;
  const cx = w/2, cz = h/2;

  // road curve
  const pts = roadCurve.getPoints(120);
  mctx.strokeStyle = "rgba(0,212,255,.6)";
  mctx.lineWidth = 2*devicePixelRatio;
  mctx.beginPath();
  for(let i=0;i<pts.length;i++){
    const x = cx + pts[i].x * scale;
    const z = cz + pts[i].z * scale;
    if(i===0) mctx.moveTo(x,z); else mctx.lineTo(x,z);
  }
  mctx.closePath();
  mctx.stroke();

  // player dot
  const px = cx + pos.x*scale;
  const pz = cz + pos.z*scale;
  mctx.fillStyle = "#00d4ff";
  mctx.beginPath();
  mctx.arc(px, pz, 4.2*devicePixelRatio, 0, Math.PI*2);
  mctx.fill();

  // direction
  mctx.strokeStyle = "rgba(255,255,255,.85)";
  mctx.beginPath();
  mctx.moveTo(px,pz);
  mctx.lineTo(px + Math.sin(yaw)*12*devicePixelRatio, pz + Math.cos(yaw)*12*devicePixelRatio);
  mctx.stroke();

  // border
  mctx.strokeStyle = "rgba(255,255,255,.12)";
  mctx.strokeRect(0,0,w,h);
}

function tick(){
  requestAnimationFrame(tick);
  const dt = Math.min(0.033, clock.getDelta());

  // inputs (hand OR touch)
  const steerIn = useHands ? handSteer : joyVec.x;
  const accelIn = useHands ? handAccel : (accelHold ? 1 : 0);
  const brakeIn = useHands ? handBrake : (brakeHold ? 1 : 0);
  const drifting = useHands ? handDrift : (brakeIn && Math.abs(steerIn) > 0.35);

  // smoothing steer
  steer += (steerIn - steer) * 0.10;

  // speed
  const maxV = 20;
  if(accelIn) v += 22*dt;
  else v -= 9*dt;
  if(brakeIn) v -= 32*dt;
  v = clamp(v, 0, maxV);

  // lane offset changes by steer
  const laneSpeed = (0.85 + v/maxV);
  laneOffset += steer * laneSpeed * dt * (drifting ? 1.45 : 1.0);
  laneOffset = clamp(laneOffset, -1, 1);

  // move forward along road curve by speed
  // convert speed to param advance
  tOnRoad += (v * dt) / 210; // tune
  if(tOnRoad > 1) tOnRoad -= 1;

  const p = roadCurve.getPointAt(tOnRoad);
  const tan = roadCurve.getTangentAt(tOnRoad).normalize();
  const n = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

  // drift slip (side movement) for GTA feel
  driftSlip += (drifting ? steer * 1.25 : 0 - driftSlip) * 0.06;
  driftSlip = clamp(driftSlip, -0.8, 0.8);

  const off = (laneOffset * (ROAD_W*0.34)) + (driftSlip * (ROAD_W*0.30));
  pos.set(p.x, 0, p.z).addScaledVector(n, off);

  // yaw follow tangent + a bit steer
  const baseYaw = Math.atan2(tan.x, tan.z);
  yaw += (baseYaw + steer*0.25 - yaw) * 0.08;

  // car transform
  car.position.set(pos.x, 0, pos.z);
  car.rotation.y = yaw;
  car.rotation.z += (-steer*0.05 - car.rotation.z) * 0.12;

  // UI
  score += v * dt * (drifting ? 1.35 : 1.0);
  spdEl.textContent = v.toFixed(0);
  scrEl.textContent = score.toFixed(0);
  drEl.textContent = drifting ? "ON" : "OFF";

  drawMini();
  updateCamera();
  renderer.render(scene, camera);
}

tick();

addEventListener("resize", ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
