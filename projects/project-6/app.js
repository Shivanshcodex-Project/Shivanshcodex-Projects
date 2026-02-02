const canvas = document.getElementById("c");
const video = document.getElementById("video");

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const toggleHudBtn = document.getElementById("toggleHudBtn");

const hud = document.getElementById("hud");
const toast = document.getElementById("toast");
const stateChip = document.getElementById("stateChip");

const speedVal = document.getElementById("speedVal");
const scoreVal = document.getElementById("scoreVal");
const bestVal  = document.getElementById("bestVal");

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x, a.y-b.y);

function setState(txt){
  stateChip.textContent = txt;
}

function setToast(txt){
  toast.textContent = txt;
  toast.style.opacity = "1";
  clearTimeout(setToast._t);
  setToast._t = setTimeout(()=> toast.style.opacity="0.75", 1600);
}

toggleHudBtn.addEventListener("click", ()=>{
  hud.classList.toggle("collapsed");
  toggleHudBtn.textContent = hud.classList.contains("collapsed") ? "Show UI" : "Hide UI";
});

// auto collapse on mobile for better view
if (window.matchMedia("(max-width: 480px)").matches){
  hud.classList.add("collapsed");
  toggleHudBtn.textContent = "Show UI";
}

// -------------------- THREE (Mobile-first) --------------------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x061018, 8, 40);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 200);
camera.position.set(0, 3.6, 7.5);
camera.lookAt(0, 0.9, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const hemi = new THREE.HemisphereLight(0x99d9ff, 0x0a1622, 1.2);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(4, 8, 6);
scene.add(dir);

// Road
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 200, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x071624, roughness: 1, metalness: 0 })
);
road.rotation.x = -Math.PI/2;
road.position.z = -80;
scene.add(road);

// Lane lines (simple repeated boxes)
const laneGroup = new THREE.Group();
scene.add(laneGroup);
for(let i=0;i<70;i++){
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.01, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x0fcfff, emissive: 0x001b24, roughness: 1 })
  );
  line.position.set(0, 0.01, -i*2.8);
  laneGroup.add(line);
}

// Side neon rails
function makeRail(x){
  const g = new THREE.BoxGeometry(0.12, 0.06, 200);
  const m = new THREE.MeshStandardMaterial({ color: 0x0aaad1, emissive: 0x013042, roughness: 1 });
  const r = new THREE.Mesh(g,m);
  r.position.set(x, 0.03, -80);
  return r;
}
scene.add(makeRail(-2.2));
scene.add(makeRail( 2.2));

// Car (simple premium look)
const car = new THREE.Group();
scene.add(car);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 0.3, 1.6),
  new THREE.MeshStandardMaterial({ color: 0x0b1d2b, metalness: 0.25, roughness: 0.35 })
);
body.position.y = 0.35;
car.add(body);

const topCabin = new THREE.Mesh(
  new THREE.BoxGeometry(0.65, 0.22, 0.75),
  new THREE.MeshStandardMaterial({ color: 0x0c2e3f, metalness: 0.2, roughness: 0.25 })
);
topCabin.position.set(0, 0.55, -0.1);
car.add(topCabin);

// glow under
const glow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.2, 2.0),
  new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent:true, opacity:0.14 })
);
glow.rotation.x = -Math.PI/2;
glow.position.y = 0.02;
car.add(glow);

car.position.set(0, 0, 2.1);

// Obstacles
const obsMat = new THREE.MeshStandardMaterial({ color: 0x2b0b1f, emissive: 0x12040a, roughness: 0.85 });
const obstacles = [];
function spawnObstacle(z){
  const o = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), obsMat);
  o.position.set((Math.random()<0.5?-1:1) * (0.9 + Math.random()*0.8), 0.3, z);
  scene.add(o);
  obstacles.push(o);
}
for(let i=0;i<8;i++) spawnObstacle(-10 - i*8);

// Particles (background stars) cheap
const starGeo = new THREE.BufferGeometry();
const starCount = 650;
const starPos = new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){
  starPos[i*3]   = (Math.random()-0.5)*26;
  starPos[i*3+1] = Math.random()*12 + 1;
  starPos[i*3+2] = -Math.random()*70;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ size:0.03, color:0x66d7ff, transparent:true, opacity:0.55 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// -------------------- GAME STATE --------------------
let running = true;
let gameOver = false;

let speed = 0;            // current speed
let targetSpeed = 0;      // based on right hand
let maxSpeed = 22;        // tuned for mobile
let score = 0;
let best = Number(localStorage.getItem("gd_best")||"0");
bestVal.textContent = best;

let steerTarget = 0;      // -1..+1
let steer = 0;            // smoothed
let boostUntil = 0;

// bounds
const laneLimit = 1.65;

// -------------------- HAND TRACKING (2 hands) --------------------
let hands = null;
let stream = null;
let rafId = null;
let cameraUtils = null;

function palmSize(hand){
  // wrist to middle_mcp
  return dist(hand[0], hand[9]) + 1e-6;
}
function extScore(hand, tipIdx, pipIdx, size){
  const wrist = hand[0];
  return (dist(hand[tipIdx], wrist) - dist(hand[pipIdx], wrist)) / size;
}
function isExt(hand, tipIdx, pipIdx, size){
  return extScore(hand, tipIdx, pipIdx, size) > 0.12; // mobile-friendly
}
function isFist(hand, size){
  const palm = hand[9];
  const tips = [8,12,16,20];
  const avg = tips.reduce((s,i)=> s + dist(hand[i], palm), 0) / tips.length;
  return (avg/size) < 1.18;
}

// Right hand open = accelerate, fist = brake
function isOpenPalm(hand, size){
  const idx = isExt(hand, 8, 6, size);
  const mid = isExt(hand, 12,10,size);
  const ring= isExt(hand, 16,14,size);
  const pin = isExt(hand, 20,18,size);
  return [idx,mid,ring,pin].filter(Boolean).length >= 3;
}
function isTwoFingers(hand, size){
  const idx = isExt(hand, 8, 6, size);
  const mid = isExt(hand, 12,10,size);
  const ring= isExt(hand, 16,14,size);
  const pin = isExt(hand, 20,18,size);
  return idx && mid && !ring && !pin;
}

function setupHands(){
  if(typeof Hands === "undefined"){
    setState("Hands lib missing");
    return false;
  }
  hands = new Hands({ locateFile:(f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });
  hands.onResults(onHandResults);
  return true;
}

let lastSeenHandsAt = 0;

function onHandResults(results){
  if(!results?.multiHandLandmarks?.length){
    // if no hands, slowly decay controls
    steerTarget *= 0.95;
    targetSpeed = lerp(targetSpeed, 0, 0.05);
    return;
  }

  lastSeenHandsAt = performance.now();

  const handsLm = results.multiHandLandmarks;
  const handed = results.multiHandedness || [];

  // Identify left and right by label if available
  let leftHand = null;
  let rightHand = null;

  for(let i=0;i<handsLm.length;i++){
    const label = handed[i]?.label || ""; // "Left" / "Right"
    if(label === "Left") leftHand = handsLm[i];
    else if(label === "Right") rightHand = handsLm[i];
  }

  // fallback: if labels missing, assume first=left, second=right
  if(!leftHand && handsLm.length>=1) leftHand = handsLm[0];
  if(!rightHand && handsLm.length>=2) rightHand = handsLm[1];

  // LEFT = steering
  if(leftHand){
    const palm = leftHand[9];
    // palm.x 0..1 => steer -1..+1
    steerTarget = clamp((palm.x - 0.5) * 2.2, -1, 1);
  }

  // RIGHT = speed / boost
  if(rightHand){
    const size = palmSize(rightHand);
    const open = isOpenPalm(rightHand, size);
    const fist = isFist(rightHand, size);
    const two  = isTwoFingers(rightHand, size);

    if(two){
      boostUntil = performance.now() + 650; // short boost
      setToast("BOOST ✌️");
    }

    if(open){
      targetSpeed = maxSpeed;
      setState("Accelerating ✋");
    } else if(fist){
      targetSpeed = 0;
      setState("Braking ✊");
    } else {
      // neutral: keep medium cruise
      targetSpeed = lerp(targetSpeed, maxSpeed*0.55, 0.08);
      setState("Cruise");
    }
  }
}

async function startCamera(){
  if(!navigator.mediaDevices?.getUserMedia){
    setState("Camera not supported");
    return;
  }
  if(!hands && !setupHands()) return;

  try{
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
    setState("Camera ON ✅");

    // drive mediapipe with RAF (fast)
    const loop = async()=>{
      if(!running) return;
      try{ await hands.send({ image: video }); } catch(e){}
      rafId = requestAnimationFrame(loop);
    };
    loop();

    setToast("Show hands to control 🚗");
  } catch(err){
    setState("Camera denied/blocked");
    setToast("Allow camera in site settings");
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

  setState("Camera OFF");
  setToast("Camera stopped");
}

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);

// -------------------- GAME LOOP --------------------
let lastT = performance.now();

function resetGame(){
  gameOver = false;
  score = 0;
  speed = 0;
  targetSpeed = 0;
  car.position.x = 0;
  steer = 0;

  // reset obstacles
  obstacles.forEach((o, idx)=>{
    o.position.z = -10 - idx*8;
    o.position.x = (Math.random()<0.5?-1:1) * (0.9 + Math.random()*0.8);
  });

  setToast("Go! ✋ accelerate");
}

function checkCollision(){
  // simple AABB in lane
  for(const o of obstacles){
    const dz = Math.abs(o.position.z - car.position.z);
    const dx = Math.abs(o.position.x - car.position.x);
    if(dz < 0.9 && dx < 0.75){
      return true;
    }
  }
  return false;
}

function animate(){
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = clamp((now - lastT)/1000, 0.0, 0.035);
  lastT = now;

  // smooth steer + move car
  steer = lerp(steer, steerTarget, 0.12);
  car.position.x = lerp(car.position.x, steer * laneLimit, 0.18);
  car.position.x = clamp(car.position.x, -laneLimit, laneLimit);

  // boost
  const boosted = now < boostUntil;
  const boostMul = boosted ? 1.35 : 1.0;

  // speed smoothing
  speed = lerp(speed, targetSpeed * boostMul, 0.08);

  // UI
  speedVal.textContent = Math.round(speed);
  scoreVal.textContent = Math.floor(score);
  bestVal.textContent = best;

  // move road lines
  laneGroup.children.forEach(line=>{
    line.position.z += speed * dt * 2.2;
    if(line.position.z > 6) line.position.z = -190;
  });

  // obstacles move towards player
  if(!gameOver){
    obstacles.forEach(o=>{
      o.position.z += speed * dt * 2.4;
      if(o.position.z > 6){
        o.position.z = -Math.random()*60 - 40;
        o.position.x = (Math.random()<0.5?-1:1) * (0.9 + Math.random()*0.8);
      }
    });

    // score
    score += speed * dt * 1.4;

    // collision
    if(checkCollision()){
      gameOver = true;
      setState("CRASH 💥 Tap to restart");
      setToast("Crash! Tap screen to restart");
      best = Math.max(best, Math.floor(score));
      localStorage.setItem("gd_best", String(best));
    }
  } else {
    // slow down on game over
    targetSpeed = 0;
  }

  // camera subtle follow
  camera.position.x = lerp(camera.position.x, car.position.x * 0.15, 0.08);

  // if camera ON but hands not seen for long: show hint
  if(startBtn.disabled && (now - lastSeenHandsAt) > 1200){
    setState("No hands detected 👋");
  }

  renderer.render(scene, camera);
}
animate();

// tap to restart when crashed
addEventListener("pointerdown", ()=>{
  if(gameOver) resetGame();
});

// resize
addEventListener("resize", ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// initial
setState("Ready");
setToast("Enable Camera to start");
