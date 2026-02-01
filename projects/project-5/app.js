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

const COUNT = 4200; // ✅ more particles
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
const basePos   = new Float32Array(COUNT * 3);
const velocity  = new Float32Array(COUNT * 3);

const material = new THREE.PointsMaterial({
  size:0.034,
  color: new THREE.Color(0x00d4ff),
  transparent:true,
  opacity:0.95
});

const points = new THREE.Points(geometry, material);
scene.add(points);

let spread = 1;
let targetRotX = 0, targetRotY = 0;
let hue = 195; // cyan base
let burstPower = 0;

// ---------- utilities ----------
function rand(a,b){ return a + Math.random()*(b-a); }
function setPoint(i, x,y,z){
  positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
  basePos[i*3]=x;   basePos[i*3+1]=y;   basePos[i*3+2]=z;
  velocity[i*3]=0; velocity[i*3+1]=0; velocity[i*3+2]=0;
}
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

// ---------- Templates ----------
function buildHeart(){
  for(let i=0;i<COUNT;i++){
    const t = Math.random()*Math.PI*2;
    const x = 16*Math.pow(Math.sin(t),3);
    const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    const s = 0.09;
    setPoint(i, x*s, y*s, rand(-0.4,0.4));
  }
}

function buildFlower(){
  const k = 6; // petals
  for(let i=0;i<COUNT;i++){
    const t = Math.random()*Math.PI*2;
    const r = Math.cos(k*t);
    const x = r*Math.cos(t);
    const y = r*Math.sin(t);
    setPoint(i, x*2.3, y*2.3, rand(-0.55,0.55));
  }
}

function buildSaturn(){
  for(let i=0;i<COUNT;i++){
    const u = Math.random();
    if(u < 0.34){
      const a = Math.random()*Math.PI*2;
      const b = Math.acos(rand(-1,1));
      const r = rand(0.0, 0.95);
      const x = r*Math.sin(b)*Math.cos(a);
      const y = r*Math.sin(b)*Math.sin(a);
      const z = r*Math.cos(b);
      setPoint(i, x*1.8, y*1.8, z*1.8);
    }else{
      const t = Math.random()*Math.PI*2;
      const r = rand(1.45, 2.55);
      const x = Math.cos(t)*r;
      const z = Math.sin(t)*r;
      const y = rand(-0.09,0.09);
      setPoint(i, x, y, z);
    }
  }
}

function buildFireworkSeed(){
  for(let i=0;i<COUNT;i++){
    const a = Math.random()*Math.PI*2;
    const b = Math.acos(rand(-1,1));
    const r = Math.pow(Math.random(), 1.9) * 0.62;
    const x = r*Math.sin(b)*Math.cos(a);
    const y = r*Math.sin(b)*Math.sin(a);
    const z = r*Math.cos(b);
    setPoint(i, x, y, z);
  }
}

function buildSpiral(){
  for(let i=0;i<COUNT;i++){
    const t = i/COUNT * 45;
    const r = 0.028*t;
    const x = Math.cos(t)*r;
    const y = (i/COUNT - 0.5)*4.2;
    const z = Math.sin(t)*r;
    setPoint(i, x*2.2, y, z*2.2);
  }
}

// ⭐ Star (5-point)
function buildStar(){
  const spikes = 5;
  const R = 2.4;
  const r = 1.1;
  for(let i=0;i<COUNT;i++){
    const t = Math.random()*Math.PI*2;
    const k = spikes;
    // alternate radius using a smooth function
    const wobble = (Math.cos(k*t) + 1) * 0.5; // 0..1
    const rad = r + wobble*(R-r);
    const x = Math.cos(t) * rad;
    const y = Math.sin(t) * rad;
    setPoint(i, x, y, rand(-0.45,0.45));
  }
}

// 🦋 Butterfly (simple wings + body)
function buildButterfly(){
  for(let i=0;i<COUNT;i++){
    const side = Math.random() < 0.5 ? -1 : 1;
    // wings: two lobes
    const t = Math.random()*Math.PI*2;
    const wing = 1.2 + 0.55*Math.cos(2*t);
    const x = side * Math.cos(t) * wing * 1.9;
    const y = Math.sin(t) * wing * 1.35;
    // body thickness
    const z = rand(-0.35,0.35);
    // slight pinch to center
    const pinch = 1 - Math.abs(x)/4.5;
    setPoint(i, x, y, z*pinch);
  }
  // add a thin body line using last 10% points
  const start = Math.floor(COUNT*0.9);
  for(let i=start;i<COUNT;i++){
    const y = rand(-2.2,2.2);
    const x = rand(-0.12,0.12);
    const z = rand(-0.12,0.12);
    setPoint(i, x, y, z);
  }
}

// 📝 Text points from canvas
function buildTextPoints(text="ShivanshCodex"){
  const W = 900, H = 260;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // background
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,W,H);

  // draw text
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 110px system-ui, Arial";
  ctx.fillText(text, W/2, H/2);

  const img = ctx.getImageData(0,0,W,H).data;

  // collect white pixels
  const pts = [];
  const step = 3; // density
  for(let y=0;y<H;y+=step){
    for(let x=0;x<W;x+=step){
      const idx = (y*W + x)*4;
      const a = img[idx+3];
      if(a > 50){
        pts.push({x, y});
      }
    }
  }

  // if too many pts, sample
  const needed = COUNT;
  for(let i=0;i<COUNT;i++){
    const p = pts[Math.floor(Math.random()*pts.length)] || {x:W/2,y:H/2};
    const nx = (p.x / W - 0.5) * 6.0;   // scale to 3D space
    const ny = (0.5 - p.y / H) * 2.0;
    const nz = rand(-0.28, 0.28);
    setPoint(i, nx, ny, nz);
  }
}

const Templates = [
  { name:"Heart",    build: () => buildHeart() },
  { name:"Flower",   build: () => buildFlower() },
  { name:"Saturn",   build: () => buildSaturn() },
  { name:"Firework", build: () => buildFireworkSeed() },
  { name:"Spiral",   build: () => buildSpiral() },
  { name:"Star",     build: () => buildStar() },
  { name:"Butterfly",build: () => buildButterfly() },
  { name:"Text: ShivanshCodex", build: () => buildTextPoints("ShivanshCodex") }
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

// ---------- ADVANCED gesture detection (stable) ----------
/*
We detect finger extended by comparing:
distance(tip, mcp) relative to palm size.
This works even if hand rotates.
*/
function palmSize(hand){
  // wrist(0) to middle_mcp(9) approx size
  const w = hand[0], m = hand[9];
  return Math.hypot(w.x-m.x, w.y-m.y) + 1e-6;
}
function isExtended(hand, tipIdx, mcpIdx, size){
  const tip = hand[tipIdx];
  const mcp = hand[mcpIdx];
  return (dist(tip, mcp) / size) > 1.25; // tuned threshold
}
function isPinch(hand, size){
  const d = dist(hand[4], hand[8]) / size; // thumb tip & index tip
  return d < 0.55;
}

// Debounce with frame stability
let gestureHold = { one:0, two:0, open:0, fist:0, pinch:0 };
let cooldown = { next:0, burst:0 };

function onHandResults(results){
  if (!results?.multiHandLandmarks?.length){
    spread = clamp(spread * 0.995, 0.7, 3);
    return;
  }

  const hand = results.multiHandLandmarks[0];
  const size = palmSize(hand);

  // movement
  const palm = hand[9];
  targetRotY = (palm.x - 0.5) * 2.6;
  targetRotX = (palm.y - 0.5) * 2.6;

  // extended fingers
  const indexExt  = isExtended(hand, 8, 5, size);   // tip 8, mcp 5
  const midExt    = isExtended(hand, 12, 9, size);  // tip 12, mcp 9
  const ringExt   = isExtended(hand, 16, 13, size); // tip 16, mcp 13
  const pinkyExt  = isExtended(hand, 20, 17, size); // tip 20, mcp 17

  const extCount = [indexExt, midExt, ringExt, pinkyExt].filter(Boolean).length;

  const pinch = isPinch(hand, size);

  // define gestures
  const openPalm = extCount >= 3;                         // mostly open
  const fist     = extCount <= 1 && !indexExt && pinch;   // closed-ish
  const oneFinger= indexExt && !midExt && !ringExt && !pinkyExt;
  const twoFingers = indexExt && midExt && !ringExt && !pinkyExt;

  // hold counters (needs stable frames)
  gestureHold.open  = openPalm ? gestureHold.open+1 : 0;
  gestureHold.fist  = fist     ? gestureHold.fist+1 : 0;
  gestureHold.one   = oneFinger? gestureHold.one+1 : 0;
  gestureHold.two   = twoFingers?gestureHold.two+1 : 0;
  gestureHold.pinch = pinch ? gestureHold.pinch+1 : 0;

  const now = performance.now();

  // open palm => expand + pink hue
  if (gestureHold.open >= 3){
    spread = clamp(spread + 0.07, 0.7, 3.2);
    hue = lerp(hue, 330, 0.18);
  }

  // fist => contract + cyan hue
  if (gestureHold.fist >= 3){
    spread = clamp(spread - 0.07, 0.7, 3.2);
    hue = lerp(hue, 195, 0.18);
  }

  // pinch => warm/cool shift
  if (gestureHold.pinch >= 3){
    hue = lerp(hue, 40, 0.08); // warm
  } else {
    hue = lerp(hue, 210, 0.03); // slight cool drift
  }

  // one finger => NEXT template (cooldown + hold)
  if (gestureHold.one >= 5 && now > cooldown.next){
    cooldown.next = now + 900;
    applyTemplate(tplIndex + 1);
  }

  // two fingers => FIREWORK burst (cooldown + hold)
  if (gestureHold.two >= 5 && now > cooldown.burst){
    cooldown.burst = now + 900;
    doBurst();
  }

  // apply color
  const h = (hue % 360) / 360;
  material.color.setHSL(h, 1, 0.55);

  // apply spread
  points.scale.set(spread, spread, spread);
}

// ---------- Firework burst ----------
function doBurst(){
  burstPower = 1.0;

  for(let i=0;i<COUNT;i++){
    const x = positions[i*3], y = positions[i*3+1], z = positions[i*3+2];
    const len = Math.hypot(x,y,z) || 1;
    velocity[i*3]   += (x/len) * rand(0.02,0.07);
    velocity[i*3+1] += (y/len) * rand(0.02,0.07);
    velocity[i*3+2] += (z/len) * rand(0.02,0.07);
  }
  setStatus("Firework burst 🎆 (✌️ two fingers)");
}

// ---------- loop ----------
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

// ---------- physics update ----------
function updateParticles(){
  burstPower *= 0.94;
  if (burstPower < 0.001) burstPower = 0;

  const t = performance.now()*0.001;

  for(let i=0;i<COUNT;i++){
    const ix = i*3;

    const bx = basePos[ix], by = basePos[ix+1], bz = basePos[ix+2];
    let x = positions[ix], y = positions[ix+1], z = positions[ix+2];

    // spring back to template
    const spring = 0.020;
    velocity[ix]   += (bx - x) * spring;
    velocity[ix+1] += (by - y) * spring;
    velocity[ix+2] += (bz - z) * spring;

    // damping
    const damp = 0.885;
    velocity[ix]   *= damp;
    velocity[ix+1] *= damp;
    velocity[ix+2] *= damp;

    x += velocity[ix];
    y += velocity[ix+1];
    z += velocity[ix+2];

    // subtle wave for premium motion
    x += Math.sin(t + i*0.01) * 0.0009;
    y += Math.cos(t + i*0.012) * 0.0009;

    positions[ix] = x;
    positions[ix+1] = y;
    positions[ix+2] = z;
  }
  geometry.attributes.position.needsUpdate = true;
}

// ---------- render ----------
function animate(){
  requestAnimationFrame(animate);

  points.rotation.y += (targetRotY - points.rotation.y) * 0.12;
  points.rotation.x += (targetRotX - points.rotation.x) * 0.12;
  points.rotation.z += 0.0019;

  updateParticles();
  renderer.render(scene, camera3D);
}
animate();

addEventListener("resize", () => {
  camera3D.aspect = innerWidth/innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

setStatus("Ready ✅  ☝️1 finger = Next  | ✌️2 finger = Burst  | ✋ Open = Expand  | ✊ Fist = Contract");
