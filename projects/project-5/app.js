const canvas = document.getElementById("three");
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const nextBtn  = document.getElementById("nextBtn");
const statusEl = document.getElementById("status");
const tplPill  = document.getElementById("tplPill");

function setStatus(msg){ statusEl.textContent = "Status: " + msg; }
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

// ---------- THREE ----------
const scene = new THREE.Scene();
const camera3D = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera3D.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const COUNT = 3500; // ✅ more particles
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
const basePos   = new Float32Array(COUNT * 3);
const velocity  = new Float32Array(COUNT * 3);

const color = new THREE.Color(0x00d4ff);
const material = new THREE.PointsMaterial({
  size:0.035,
  color,
  transparent:true,
  opacity:0.95
});
const points = new THREE.Points(geometry, material);
scene.add(points);

let spread = 1;
let targetRotX = 0, targetRotY = 0;
let hue = 195; // cyan base
let burstPower = 0;

// ---------- Templates ----------
const Templates = [
  { name:"Heart",   build: buildHeart },
  { name:"Flower",  build: buildFlower },
  { name:"Saturn",  build: buildSaturn },
  { name:"Firework",build: buildFireworkSeed },
  { name:"Spiral",  build: buildSpiral }
];

let tplIndex = 0;

function applyTemplate(index){
  tplIndex = (index + Templates.length) % Templates.length;
  tplPill.textContent = "Template: " + Templates[tplIndex].name;
  Templates[tplIndex].build();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.attributes.position.needsUpdate = true;
  setStatus(`Template loaded ✅ (${Templates[tplIndex].name})`);
}

function setPoint(i, x,y,z){
  positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
  basePos[i*3]=x;   basePos[i*3+1]=y;   basePos[i*3+2]=z;
  velocity[i*3]=0; velocity[i*3+1]=0; velocity[i*3+2]=0;
}

function rand(a,b){ return a + Math.random()*(b-a); }

function buildHeart(){
  // parametric heart in 2D, slight depth jitter
  for(let i=0;i<COUNT;i++){
    const t = Math.random()*Math.PI*2;
    const x = 16*Math.pow(Math.sin(t),3);
    const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    const scale = 0.09;
    setPoint(i, x*scale, y*scale, rand(-0.4,0.4));
  }
}
function buildFlower(){
  // rose curve
  const k = 5; // petals
  for(let i=0;i<COUNT;i++){
    const t = Math.random()*Math.PI*2;
    const r = Math.cos(k*t);
    const x = r*Math.cos(t);
    const y = r*Math.sin(t);
    setPoint(i, x*2.2, y*2.2, rand(-0.5,0.5));
  }
}
function buildSaturn(){
  // planet + ring
  for(let i=0;i<COUNT;i++){
    const u = Math.random();
    if(u < 0.35){
      // sphere-ish core
      const a = Math.random()*Math.PI*2;
      const b = Math.acos(rand(-1,1));
      const r = rand(0.0, 0.9);
      const x = r*Math.sin(b)*Math.cos(a);
      const y = r*Math.sin(b)*Math.sin(a);
      const z = r*Math.cos(b);
      setPoint(i, x*1.8, y*1.8, z*1.8);
    }else{
      // ring
      const t = Math.random()*Math.PI*2;
      const r = rand(1.4, 2.4);
      const x = Math.cos(t)*r;
      const z = Math.sin(t)*r;
      const y = rand(-0.08,0.08);
      setPoint(i, x, y, z);
    }
  }
}
function buildFireworkSeed(){
  // compact ball (for bursts)
  for(let i=0;i<COUNT;i++){
    const a = Math.random()*Math.PI*2;
    const b = Math.acos(rand(-1,1));
    const r = Math.pow(Math.random(), 1.8) * 0.6;
    const x = r*Math.sin(b)*Math.cos(a);
    const y = r*Math.sin(b)*Math.sin(a);
    const z = r*Math.cos(b);
    setPoint(i, x, y, z);
  }
}
function buildSpiral(){
  for(let i=0;i<COUNT;i++){
    const t = i/COUNT * 40;
    const r = 0.03*t;
    const x = Math.cos(t)*r;
    const y = (i/COUNT - 0.5)*4;
    const z = Math.sin(t)*r;
    setPoint(i, x*2.2, y, z*2.2);
  }
}

applyTemplate(0);

// ---------- MediaPipe ----------
let hands = null;
let running = false;
let rafId = null;
let stream = null;

function setupHands(){
  if (typeof Hands === "undefined"){
    setStatus("MediaPipe Hands not loaded (CDN blocked).");
    return false;
  }
  hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });
  hands.onResults(onHandResults);
  return true;
}

// ---- Gesture helpers (simple & stable) ----
function dist(a,b){
  return Math.hypot(a.x-b.x, a.y-b.y);
}
function fingerUp(tip, pip){
  // tip above pip in image coordinates (y smaller = up)
  return tip.y < pip.y;
}

let lastTemplateSwitch = 0;
let lastBurst = 0;

function doBurst(){
  burstPower = 1.0;
  lastBurst = performance.now();

  // give outward velocities
  for(let i=0;i<COUNT;i++){
    const x = positions[i*3], y = positions[i*3+1], z = positions[i*3+2];
    const len = Math.hypot(x,y,z) || 1;
    velocity[i*3]   += (x/len) * rand(0.02,0.06);
    velocity[i*3+1] += (y/len) * rand(0.02,0.06);
    velocity[i*3+2] += (z/len) * rand(0.02,0.06);
  }
  setStatus("Firework burst 🎆");
}

function onHandResults(results){
  if (!results?.multiHandLandmarks?.length){
    // relax slowly if no hand
    spread = clamp(spread * 0.995, 0.7, 3);
    return;
  }

  const hand = results.multiHandLandmarks[0];
  const palm = hand[9];

  // movement control
  targetRotY = (palm.x - 0.5) * 2.4;
  targetRotX = (palm.y - 0.5) * 2.4;

  // landmarks
  const thumbTip = hand[4];
  const indexTip = hand[8];
  const indexPip = hand[6];
  const middleTip= hand[12];
  const middlePip= hand[10];
  const ringTip  = hand[16];
  const ringPip  = hand[14];
  const pinkyTip = hand[20];
  const pinkyPip = hand[18];

  // pinch = thumb-index close
  const pinch = dist(thumbTip, indexTip);

  // finger states
  const indexUp  = fingerUp(indexTip, indexPip);
  const middleUp = fingerUp(middleTip, middlePip);
  const ringUp   = fingerUp(ringTip, ringPip);
  const pinkyUp  = fingerUp(pinkyTip, pinkyPip);

  const upCount = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

  // open palm vs fist (rough)
  if (upCount >= 3){
    spread = clamp(spread + 0.06, 0.7, 3);
    hue = lerp(hue, 330, 0.15); // pinkish
  } else if (upCount <= 1 && pinch < 0.07){
    spread = clamp(spread - 0.06, 0.7, 3);
    hue = lerp(hue, 195, 0.15); // cyan
  }

  // one finger = next template (debounced)
  const now = performance.now();
  if (upCount === 1 && indexUp && (now - lastTemplateSwitch) > 900){
    lastTemplateSwitch = now;
    applyTemplate(tplIndex + 1);
  }

  // two fingers = burst (debounced)
  if (upCount === 2 && indexUp && middleUp && (now - lastBurst) > 900){
    doBurst();
  }

  // pinch controls hue smoothly
  if (pinch < 0.08){
    hue = lerp(hue, 40, 0.08);  // warm
  } else if (pinch > 0.16){
    hue = lerp(hue, 200, 0.08); // cool
  }

  // apply color
  const h = (hue % 360) / 360;
  material.color.setHSL(h, 1, 0.55);

  points.scale.set(spread, spread, spread);
}

async function loop(){
  if (!running) return;
  try{
    await hands.send({ image: video });
  }catch(e){
    setStatus("Hands error: " + (e?.message || e));
  }
  rafId = requestAnimationFrame(loop);
}

async function startCamera(){
  setStatus("Requesting camera permission…");

  if (!navigator.mediaDevices?.getUserMedia){
    setStatus("getUserMedia not supported");
    return;
  }
  if (!hands){
    const ok = setupHands();
    if (!ok) return;
  }
  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();

    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;

    setStatus("Camera ON ✅ Hand tracking running…");
    loop();
  }catch(err){
    setStatus("Camera denied/blocked: " + (err?.name || "") + " " + (err?.message || ""));
  }
}

function stopCamera(){
  running = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;

  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  if (stream){
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
  setStatus("Camera OFF");
}

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);
nextBtn.addEventListener("click", ()=> applyTemplate(tplIndex + 1));

// ---------- Physics-ish update ----------
function updateParticles(){
  // burst decay
  burstPower *= 0.94;
  if (burstPower < 0.001) burstPower = 0;

  for(let i=0;i<COUNT;i++){
    const ix = i*3;

    // spring back to base shape
    const bx = basePos[ix], by = basePos[ix+1], bz = basePos[ix+2];
    let x = positions[ix], y = positions[ix+1], z = positions[ix+2];

    const spring = 0.02;
    velocity[ix]   += (bx - x) * spring;
    velocity[ix+1] += (by - y) * spring;
    velocity[ix+2] += (bz - z) * spring;

    // apply velocity + damping
    const damp = 0.88;
    velocity[ix]   *= damp;
    velocity[ix+1] *= damp;
    velocity[ix+2] *= damp;

    x += velocity[ix];
    y += velocity[ix+1];
    z += velocity[ix+2];

    // extra flutter
    x += Math.sin((performance.now()*0.001) + i*0.01) * 0.0008;
    y += Math.cos((performance.now()*0.001) + i*0.01) * 0.0008;

    positions[ix] = x;
    positions[ix+1] = y;
    positions[ix+2] = z;
  }
  geometry.attributes.position.needsUpdate = true;
}

// ---------- Render loop ----------
function animate(){
  requestAnimationFrame(animate);

  // smooth rotation from hand
  points.rotation.y += (targetRotY - points.rotation.y) * 0.10;
  points.rotation.x += (targetRotX - points.rotation.x) * 0.10;
  points.rotation.z += 0.0018;

  updateParticles();
  renderer.render(scene, camera3D);
}
animate();

addEventListener("resize", () => {
  camera3D.aspect = innerWidth/innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

setStatus("Ready (Enable Camera) • ☝️ one finger = next template");
