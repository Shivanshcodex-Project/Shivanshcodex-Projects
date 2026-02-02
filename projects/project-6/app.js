// ---------- UI ----------
const canvas = document.getElementById("game");
const speedEl = document.getElementById("speed");
const scoreEl = document.getElementById("score");
const turnEl  = document.getElementById("turn");
const statusEl = document.getElementById("status");
const modePill = document.getElementById("modePill");

const startCamBtn = document.getElementById("startCam");
const stopCamBtn  = document.getElementById("stopCam");

const joy = document.getElementById("joy");
const knob = document.getElementById("knob");
const accelBtn = document.getElementById("accelBtn");
const brakeBtn = document.getElementById("brakeBtn");

// ---------- THREE ----------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x040813, 10, 85);

const camera = new THREE.PerspectiveCamera(62, innerWidth/innerHeight, 0.1, 200);

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x040813, 1);

// lights
scene.add(new THREE.HemisphereLight(0x99d9ff, 0x040813, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(8, 18, 10);
scene.add(sun);

// ground glow (subtle)
const glow = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200),
  new THREE.MeshBasicMaterial({ color:0x071425, transparent:true, opacity:0.25 })
);
glow.rotation.x = -Math.PI/2;
glow.position.y = -0.02;
scene.add(glow);

// ---------- CAR ----------
const car = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.2,0.55,2.2),
  new THREE.MeshStandardMaterial({ color:0xff3b30, metalness:0.25, roughness:0.35 })
);
body.position.y = 0.35;
car.add(body);

const neon = new THREE.Mesh(
  new THREE.BoxGeometry(1.35,0.12,2.35),
  new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:0.35 })
);
neon.position.y = 0.12;
car.add(neon);

scene.add(car);

// ---------- TRACK (curved road segments) ----------
const SEG_LEN = 8;
const SEG_W   = 7;
const NUM_SEG = 34;

const roadMat = new THREE.MeshStandardMaterial({ color:0x171717, roughness:0.9, metalness:0.0 });
const edgeMat = new THREE.MeshBasicMaterial({ color:0x0aa6ff });
const laneMat = new THREE.MeshBasicMaterial({ color:0xffffff });

function makeSegment(){
  const g = new THREE.Group();

  const road = new THREE.Mesh(new THREE.PlaneGeometry(SEG_W, SEG_LEN), roadMat);
  road.rotation.x = -Math.PI/2;
  g.add(road);

  // edges neon
  const eL = new THREE.Mesh(new THREE.PlaneGeometry(0.08, SEG_LEN), edgeMat);
  eL.rotation.x = -Math.PI/2;
  eL.position.set(-SEG_W/2 + 0.1, 0.015, 0);
  g.add(eL);

  const eR = eL.clone();
  eR.position.x = SEG_W/2 - 0.1;
  g.add(eR);

  // lane lines
  const l1 = new THREE.Mesh(new THREE.PlaneGeometry(0.05, SEG_LEN), laneMat);
  l1.rotation.x = -Math.PI/2;
  l1.position.set(-SEG_W/6, 0.02, 0);
  g.add(l1);

  const l2 = l1.clone();
  l2.position.x = SEG_W/6;
  g.add(l2);

  return g;
}

const segments = [];
let trackHead = new THREE.Vector3(0,0,0);
let heading = 0;               // current road direction (radians)
let curve = 0;                 // current curvature
let targetCurve = 0;           // where road wants to go

function placeNextSegment(seg, prevPos, prevHeading){
  // slowly change curve
  curve += (targetCurve - curve) * 0.05;
  const newHeading = prevHeading + curve;

  // move forward in newHeading direction
  const dx = Math.sin(newHeading) * SEG_LEN;
  const dz = Math.cos(newHeading) * SEG_LEN;

  const newPos = prevPos.clone().add(new THREE.Vector3(dx,0,dz));
  seg.position.copy(newPos);
  seg.rotation.y = newHeading;

  return { pos:newPos, heading:newHeading };
}

// init segments
let lastPos = new THREE.Vector3(0,0,0);
let lastHeading = 0;
for(let i=0;i<NUM_SEG;i++){
  const s = makeSegment();
  scene.add(s);
  const out = placeNextSegment(s, lastPos, lastHeading);
  lastPos = out.pos; lastHeading = out.heading;
  segments.push(s);
}
trackHead.copy(lastPos);

// ---------- GAME STATE ----------
let speed = 0;
let accel = 0;
let steer = 0;
let score = 0;

let laneX = 0;           // car lateral offset
let laneTarget = 0;

let running = true;

// camera follow (third-person)
function updateCamera(){
  // camera behind car aligned with heading
  const back = new THREE.Vector3(
    -Math.sin(heading)*8,
     6,
    -Math.cos(heading)*8
  );
  const camPos = car.position.clone().add(back);
  camera.position.lerp(camPos, 0.10);

  const look = car.position.clone().add(new THREE.Vector3(Math.sin(heading)*10, 1.2, Math.cos(heading)*10));
  camera.lookAt(look);
}

// ---------- INPUT: TOUCH joystick + pedals ----------
let joyActive = false;
let joyStart = {x:0,y:0};
let joyVec = {x:0,y:0};

function setKnob(x,y){
  knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

joy.addEventListener("pointerdown", (e)=>{
  joyActive = true;
  joy.setPointerCapture(e.pointerId);
  joyStart = {x:e.clientX, y:e.clientY};
});

joy.addEventListener("pointermove", (e)=>{
  if(!joyActive) return;
  const dx = e.clientX - joyStart.x;
  const dy = e.clientY - joyStart.y;
  const max = 38;
  const clx = Math.max(-max, Math.min(max, dx));
  const cly = Math.max(-max, Math.min(max, dy));
  joyVec.x = clx/max;     // -1..1 steer
  joyVec.y = cly/max;     // unused
  setKnob(clx, cly);
});

function endJoy(){
  joyActive = false;
  joyVec.x = 0; joyVec.y = 0;
  setKnob(0,0);
}
joy.addEventListener("pointerup", endJoy);
joy.addEventListener("pointercancel", endJoy);

let pedalAccel = false, pedalBrake = false;
accelBtn.addEventListener("pointerdown", ()=> pedalAccel = true);
accelBtn.addEventListener("pointerup", ()=> pedalAccel = false);
accelBtn.addEventListener("pointercancel", ()=> pedalAccel = false);

brakeBtn.addEventListener("pointerdown", ()=> pedalBrake = true);
brakeBtn.addEventListener("pointerup", ()=> pedalBrake = false);
brakeBtn.addEventListener("pointercancel", ()=> pedalBrake = false);

// ---------- INPUT: HAND (MediaPipe) ----------
let mpCamera = null;
let handMode = false;
let handSteer = 0;
let handAccel = 0;   // 0..1
let handBrake = 0;

const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.70,
  minTrackingConfidence: 0.70
});

hands.onResults((res)=>{
  if(!res.multiHandLandmarks || !res.multiHandLandmarks[0]){
    statusEl.textContent = handMode ? "Camera ON • No hand detected" : statusEl.textContent;
    return;
  }

  const h = res.multiHandLandmarks[0];

  // steer by palm center x (landmark 9)
  handSteer = (h[9].x - 0.5) * 2.6;     // -1.3..1.3 approx

  // open/fist detection
  const open =
    (h[8].y < h[6].y) &&
    (h[12].y < h[10].y);

  const fist =
    (h[8].y > h[6].y) &&
    (h[12].y > h[10].y);

  handAccel = open ? 1 : 0;
  handBrake = fist ? 1 : 0;

  statusEl.textContent = "Camera ON • Hand tracking ✅";
});

async function startHand(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"user" }, audio:false });
    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();

    mpCamera = new Camera(video, {
      onFrame: async () => { await hands.send({ image: video }); }
    });
    mpCamera.start();

    handMode = true;
    modePill.textContent = "Hand";
    startCamBtn.disabled = true;
    stopCamBtn.disabled  = false;
    statusEl.textContent = "Camera ON • Starting...";
  }catch(err){
    statusEl.textContent = "Camera blocked. Chrome → Site settings → Camera → Allow";
  }
}

function stopHand(){
  try{ mpCamera && mpCamera.stop(); }catch(e){}
  mpCamera = null;
  handMode = false;
  modePill.textContent = "Manual";
  startCamBtn.disabled = false;
  stopCamBtn.disabled  = true;
  statusEl.textContent = "Stopped";
}

startCamBtn.addEventListener("click", startHand);
stopCamBtn.addEventListener("click", stopHand);

// ---------- GAME LOOP ----------
const clock = new THREE.Clock();
car.position.set(0,0,0);

function tick(){
  requestAnimationFrame(tick);
  if(!running) return;

  const dt = Math.min(0.033, clock.getDelta());

  // decide inputs (hand has priority if enabled)
  const steerIn = handMode ? handSteer : joyVec.x;
  const accelIn = handMode ? handAccel : (pedalAccel ? 1 : 0);
  const brakeIn = handMode ? handBrake : (pedalBrake ? 1 : 0);

  // smooth steer
  steer += (steerIn - steer) * 0.12;

  // speed physics
  const targetSpeed = accelIn ? 18 : 6; // idle move even without accel (game feel)
  const braking = brakeIn ? 1 : 0;

  // accelerate towards target
  speed += (targetSpeed - speed) * (accelIn ? 0.06 : 0.02);
  // brake
  speed -= braking * 30 * dt;
  speed = Math.max(0, Math.min(22, speed));

  // turn system: heading changes with road curve + steer
  // more speed = more stable turning
  const steerPower = 0.9;
  heading += (curve * 0.6 + steer * 0.015 * steerPower) * (speed/18);

  // move car forward in heading
  const forward = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
  car.position.addScaledVector(forward, speed * dt);

  // lane offset (car stays on road)
  laneTarget = THREE.MathUtils.clamp(steer * 2.0, -2.1, 2.1);
  laneX += (laneTarget - laneX) * 0.10;

  // apply lateral offset perpendicular to heading
  const right = new THREE.Vector3(Math.cos(heading), 0, -Math.sin(heading));
  const basePos = car.position.clone();
  car.position.copy(basePos.addScaledVector(right, laneX));

  // car tilt / yaw
  car.rotation.y = heading;
  car.rotation.z += (-steer*0.02 - car.rotation.z) * 0.12;

  // camera follow
  updateCamera();

  // recycle road segments ahead of car
  // if car passed the first segment, move it to end
  // (simple: find segment far behind camera)
  const camPos = camera.position;
  for(let i=0;i<segments.length;i++){
    const s = segments[i];
    // if segment is too far behind car, recycle
    if(s.position.distanceTo(car.position) > 120 && isBehind(s.position, car.position, heading)){
      // randomize targetCurve sometimes (GTA-like turns)
      if(Math.random() < 0.25){
        targetCurve = THREE.MathUtils.clamp((Math.random()-0.5)*0.08, -0.04, 0.04);
      }

      // place this segment after trackHead
      const out = placeNextSegment(s, trackHead, lastHeading);
      trackHead.copy(out.pos);
      lastHeading = out.heading;
    }
  }

  // score
  score += speed * dt * 0.9;

  // UI
  speedEl.textContent = speed.toFixed(0);
  scoreEl.textContent = score.toFixed(0);
  turnEl.textContent  = (targetCurve*1000).toFixed(0);

  renderer.render(scene, camera);
}

function isBehind(segPos, carPos, head){
  // check if segment is behind car along heading direction
  const toSeg = segPos.clone().sub(carPos);
  const forward = new THREE.Vector3(Math.sin(head),0,Math.cos(head));
  return toSeg.dot(forward) < -20; // behind
}

tick();

// resize
addEventListener("resize", ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
