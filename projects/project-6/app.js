const canvas = document.getElementById("c");
const mini = document.getElementById("minimap");
const mctx = mini.getContext("2d");

const spdEl = document.getElementById("spd");
const scrEl = document.getElementById("scr");
const znEl  = document.getElementById("zn");
const areaEl = document.getElementById("area");

const resetBtn = document.getElementById("reset");
const toggleCamBtn = document.getElementById("toggleCam");

const joy = document.getElementById("joy");
const knob = document.getElementById("knob");
const accelBtn = document.getElementById("accel");
const brakeBtn = document.getElementById("brake");

// ---------- THREE SETUP ----------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050914, 15, 120);

const camera = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x050914, 1);

// light
scene.add(new THREE.HemisphereLight(0xa6ddff, 0x050914, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(10, 22, 10);
scene.add(sun);

// ---------- WORLD (mini city map) ----------
const WORLD = 120; // world size
const roads = [];
const buildings = [];
const roadMat = new THREE.MeshStandardMaterial({ color:0x141414, roughness:0.95 });
const laneMat = new THREE.MeshBasicMaterial({ color:0x8aa0b6, transparent:true, opacity:0.55 });
const neonEdge = new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.35 });
const groundMat = new THREE.MeshStandardMaterial({ color:0x071225, roughness:1 });

const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD, WORLD), groundMat);
ground.rotation.x = -Math.PI/2;
ground.position.y = -0.02;
scene.add(ground);

// make a simple grid-road city: main roads + side roads
function addRoad(x, z, w, h){
  const g = new THREE.Group();
  const r = new THREE.Mesh(new THREE.PlaneGeometry(w, h), roadMat);
  r.rotation.x = -Math.PI/2;
  g.add(r);

  // lane line center
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(0.4,w*0.07), h*0.92), laneMat);
  lane.rotation.x = -Math.PI/2;
  lane.position.y = 0.01;
  g.add(lane);

  // neon edges
  const e1 = new THREE.Mesh(new THREE.PlaneGeometry(0.15, h), neonEdge);
  e1.rotation.x = -Math.PI/2;
  e1.position.set(-w/2 + 0.12, 0.015, 0);
  g.add(e1);

  const e2 = e1.clone();
  e2.position.x = w/2 - 0.12;
  g.add(e2);

  g.position.set(x, 0, z);
  scene.add(g);
  roads.push({x,z,w,h});
  return g;
}

// main roads
addRoad(0, 0, 14, WORLD);      // vertical main
addRoad(0, 0, WORLD, 14);      // horizontal main

// extra roads
for(let i=-40;i<=40;i+=20){
  if(i!==0){
    addRoad(i, 0, 10, WORLD);
    addRoad(0, i, WORLD, 10);
  }
}

// buildings (blocks)
function addBuilding(x,z,w,d,h,color){
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness:0.55, metalness:0.08 })
  );
  m.position.set(x, h/2, z);
  scene.add(m);
  buildings.push(m);
}

function rand(a,b){ return a + Math.random()*(b-a); }

for(let i=0;i<90;i++){
  const x = rand(-WORLD/2+6, WORLD/2-6);
  const z = rand(-WORLD/2+6, WORLD/2-6);

  // keep buildings away from main roads
  if(Math.abs(x) < 10 || Math.abs(z) < 10) continue;
  if((Math.abs(x)%20) < 8 || (Math.abs(z)%20) < 8) continue;

  addBuilding(
    x, z,
    rand(3,7),
    rand(3,7),
    rand(4,16),
    new THREE.Color().setHSL(0.55 + Math.random()*0.12, 0.45, 0.45)
  );
}

// ---------- CAR (player) ----------
const car = new THREE.Group();

// body
const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 0.55, 2.4),
  new THREE.MeshStandardMaterial({ color:0x0aa6ff, metalness:0.25, roughness:0.25 })
);
body.position.y = 0.35;
car.add(body);

// cabin
const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.05, 0.45, 1.1),
  new THREE.MeshStandardMaterial({ color:0x0b1020, metalness:0.1, roughness:0.2 })
);
cabin.position.set(0, 0.70, -0.1);
car.add(cabin);

// neon underglow
const glow = new THREE.Mesh(
  new THREE.BoxGeometry(1.55, 0.08, 2.55),
  new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.35 })
);
glow.position.y = 0.08;
car.add(glow);

// wheels neon (simple rings)
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
    new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.7 })
  );
  ring.position.copy(w.position);
  ring.rotation.y = Math.PI/2;
  car.add(ring);
}
wheel(-0.65, 0.85); wheel(0.65, 0.85);
wheel(-0.65,-0.85); wheel(0.65,-0.85);

scene.add(car);

// spawn
let pos = new THREE.Vector3(0,0,20);
let yaw = 0;
car.position.copy(pos);
car.rotation.y = yaw;

// ---------- CONTROLS (mobile-first) ----------
let joyActive = false;
let joyStart = {x:0,y:0};
let joyVec = {x:0,y:0}; // x for steer, y unused

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

// keyboard fallback (PC)
const keys = {};
addEventListener("keydown",(e)=> keys[e.key.toLowerCase()] = true);
addEventListener("keyup",(e)=> keys[e.key.toLowerCase()] = false);

// ---------- CAMERA MODES ----------
let camMode = "follow"; // follow / chase
toggleCamBtn.addEventListener("click", ()=>{
  camMode = (camMode==="follow") ? "chase" : "follow";
  toggleCamBtn.textContent = `Cam: ${camMode==="follow" ? "Follow" : "Chase"}`;
});

resetBtn.addEventListener("click", resetGame);

function resetGame(){
  pos.set(0,0,20);
  yaw = 0;
  v = 0;
  score = 0;
}

// ---------- GAME PHYSICS ----------
let v = 0;           // speed
let score = 0;
let steer = 0;

function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

const clock = new THREE.Clock();

function updateCamera(){
  if(camMode==="follow"){
    const back = new THREE.Vector3(Math.sin(yaw)*-7, 5.2, Math.cos(yaw)*-7);
    const target = pos.clone().add(back);
    camera.position.lerp(target, 0.12);
    camera.lookAt(pos.x, 1.2, pos.z);
  } else {
    // chase: lower, closer
    const back = new THREE.Vector3(Math.sin(yaw)*-4.6, 3.1, Math.cos(yaw)*-4.6);
    const target = pos.clone().add(back);
    camera.position.lerp(target, 0.12);
    const look = pos.clone().add(new THREE.Vector3(Math.sin(yaw)*6, 1.1, Math.cos(yaw)*6));
    camera.lookAt(look);
  }
}

function zoneOf(p){
  // simple zones by quadrants
  if(p.x>=0 && p.z>=0) return "A";
  if(p.x<0 && p.z>=0) return "B";
  if(p.x<0 && p.z<0) return "C";
  return "D";
}
function areaName(z){
  return ({A:"Downtown",B:"Harbor",C:"Old City",D:"Uptown"})[z] || "City";
}

// minimap draw
function drawMini(){
  const w = mini.width = mini.clientWidth * devicePixelRatio;
  const h = mini.height = mini.clientHeight * devicePixelRatio;

  mctx.clearRect(0,0,w,h);

  // background
  mctx.fillStyle = "rgba(0,0,0,.35)";
  mctx.fillRect(0,0,w,h);

  // map scale
  const scale = w / WORLD;
  const cx = w/2;
  const cz = h/2;

  // roads
  mctx.strokeStyle = "rgba(0,212,255,.35)";
  mctx.lineWidth = 2 * devicePixelRatio;
  roads.forEach(r=>{
    const x = cx + r.x*scale - (r.w*scale)/2;
    const z = cz + r.z*scale - (r.h*scale)/2;
    mctx.strokeRect(x, z, r.w*scale, r.h*scale);
  });

  // player dot
  const px = cx + pos.x*scale;
  const pz = cz + pos.z*scale;

  mctx.fillStyle = "#00d4ff";
  mctx.beginPath();
  mctx.arc(px, pz, 4.2*devicePixelRatio, 0, Math.PI*2);
  mctx.fill();

  // direction line
  mctx.strokeStyle = "rgba(255,255,255,.8)";
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

  // input merge
  const kbSteer = (keys["a"]||keys["arrowleft"] ? -1 : 0) + (keys["d"]||keys["arrowright"] ? 1 : 0);
  const kbAccel = (keys["w"]||keys["arrowup"]) ? 1 : 0;
  const kbBrake = (keys["s"]||keys["arrowdown"]) ? 1 : 0;

  const steerIn = clamp(joyVec.x + kbSteer, -1, 1);
  const accelIn = (accelHold || kbAccel) ? 1 : 0;
  const brakeIn = (brakeHold || kbBrake) ? 1 : 0;

  // smoothing
  steer += (steerIn - steer)*0.14;

  // speed
  const maxV = 18;
  if(accelIn) v += 22*dt;
  else v -= 10*dt; // natural slowdown
  if(brakeIn) v -= 34*dt;

  // drift (hold brake + steer)
  const drifting = brakeIn && Math.abs(steer) > 0.35;
  v = clamp(v, 0, maxV);

  // steering: more speed => more turning
  const turnPower = (0.55 + v/maxV) * (drifting ? 1.65 : 1.0);
  yaw += steer * turnPower * dt;

  // move
  pos.x += Math.sin(yaw) * v * dt;
  pos.z += Math.cos(yaw) * v * dt;

  // keep within world bounds
  pos.x = clamp(pos.x, -WORLD/2+3, WORLD/2-3);
  pos.z = clamp(pos.z, -WORLD/2+3, WORLD/2-3);

  // apply to car
  car.position.set(pos.x, 0, pos.z);
  car.rotation.y = yaw;
  car.rotation.z += (-steer*0.04 - car.rotation.z)*0.12;

  // camera + UI
  updateCamera();

  score += v * dt * (drifting ? 1.35 : 1.0);

  const z = zoneOf(pos);
  znEl.textContent = z;
  areaEl.textContent = areaName(z);

  spdEl.textContent = v.toFixed(0);
  scrEl.textContent = score.toFixed(0);

  drawMini();
  renderer.render(scene, camera);
}

tick();

addEventListener("resize", ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
