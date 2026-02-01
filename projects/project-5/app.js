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
const dist=(a,b)=>Math.hypot(a.x-b.x, a.y-b.y);

let DEBUG = true;

// ---------- Debug overlay ----------
const dbg = document.createElement("div");
dbg.style.cssText = `
  position:fixed; left:10px; bottom:10px; z-index:999999;
  padding:10px 12px; border-radius:14px;
  background:rgba(0,0,0,.45); border:1px solid rgba(255,255,255,.12);
  color:rgba(234,240,255,.9); font: 12px system-ui, Arial;
  backdrop-filter: blur(10px);
  max-width: 92vw;
`;
document.body.appendChild(dbg);
function setDbg(html){ dbg.innerHTML = DEBUG ? html : ""; }

// ---------- THREE ----------
const scene = new THREE.Scene();
const camera3D = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera3D.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const COUNT = 4200;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);
const basePos   = new Float32Array(COUNT * 3);
const velocity  = new Float32Array(COUNT * 3);

const material = new THREE.PointsMaterial({
  size:0.034,
  color:new THREE.Color(0x00d4ff),
  transparent:true,
  opacity:0.95
});
const points = new THREE.Points(geometry, material);
scene.add(points);

let spread = 1;
let targetRotX = 0, targetRotY = 0;
let hue = 195;

// ---------- helpers ----------
function rand(a,b){ return a + Math.random()*(b-a); }
function setPoint(i, x,y,z){
  positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
  basePos[i*3]=x;   basePos[i*3+1]=y;   basePos[i*3+2]=z;
  velocity[i*3]=0; velocity[i*3+1]=0; velocity[i*3+2]=0;
}

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
  const k = 6;
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
function buildStar(){
  const spikes = 5, R = 2.4, r = 1.1;
  for(let i=0;i<COUNT;i++){
    const t = Math.random()*Math.PI*2;
    const wobble = (Math.cos(spikes*t)+1)*0.5;
    const rad = r + wobble*(R-r);
    setPoint(i, Math.cos(t)*rad, Math.sin(t)*rad, rand(-0.45,0.45));
  }
}
function buildButterfly(){
  for(let i=0;i<COUNT;i++){
    const side = Math.random()<0.5 ? -1 : 1;
    const t = Math.random()*Math.PI*2;
    const wing = 1.2 + 0.55*Math.cos(2*t);
    const x = side*Math.cos(t)*wing*1.9;
    const y = Math.sin(t)*wing*1.35;
    const z = rand(-0.35,0.35);
    const pinch = 1 - Math.abs(x)/4.5;
    setPoint(i, x, y, z*pinch);
  }
  const start = Math.floor(COUNT*0.9);
  for(let i=start;i<COUNT;i++){
    setPoint(i, rand(-0.12,0.12), rand(-2.2,2.2), rand(-0.12,0.12));
  }
}
function buildTextPoints(text="ShivanshCodex"){
  const W=900, H=260;
  const c=document.createElement("canvas");
  c.width=W; c.height=H;
  const ctx=c.getContext("2d");
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#fff";
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.font="900 110px system-ui, Arial";
  ctx.fillText(text, W/2, H/2);

  const img=ctx.getImageData(0,0,W,H).data;
  const pts=[];
  const step=3;
  for(let y=0;y<H;y+=step){
    for(let x=0;x<W;x+=step){
      const idx=(y*W+x)*4;
      if(img[idx+3]>50) pts.push({x,y});
    }
  }
  for(let i=0;i<COUNT;i++){
    const p = pts[(Math.random()*pts.length)|0] || {x:W/2,y:H/2};
    const nx=(p.x/W-0.5)*6.0;
    const ny=(0.5-p.y/H)*2.0;
    setPoint(i, nx, ny, rand(-0.28,0.28));
  }
}

const Templates = [
  { name:"Heart", build:buildHeart },
  { name:"Flower", build:buildFlower },
  { name:"Saturn", build:buildSaturn },
  { name:"Firework", build:buildFireworkSeed },
  { name:"Spiral", build:buildSpiral },
  { name:"Star", build:buildStar },
  { name:"Butterfly", build:buildButterfly },
  { name:"Text: ShivanshCodex", build:() => buildTextPoints("ShivanshCodex") },
];

let tplIndex = 0;
function applyTemplate(i){
  tplIndex = (i + Templates.length) % Templates.length;
  tplPill.textContent = "Template: " + Templates[tplIndex].name;

  Templates[tplIndex].build();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.attributes.position.needsUpdate = true;

  setStatus(`Template loaded ✅ (${Templates[tplIndex].name})`);
}
applyTemplate(0);

// ---------- MediaPipe ----------
let hands=null, running=false, rafId=null, stream=null;

function setupHands(){
  if (typeof Hands === "undefined"){
    setStatus("MediaPipe Hands not loaded (CDN blocked).");
    return false;
  }
  hands = new Hands({ locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
  hands.setOptions({
    maxNumHands:1,
    modelComplexity:1,
    minDetectionConfidence:0.7,
    minTrackingConfidence:0.7
  });
  hands.onResults(onHandResults);
  return true;
}

// ---------- STRONG finger detection (tested logic) ----------
function palmSize(hand){
  // wrist(0) to middle_mcp(9)
  return dist(hand[0], hand[9]) + 1e-6;
}

/*
Finger is "extended" if:
1) finger is straight (tip-mcp distance almost equals tip-pip + pip-mcp)
2) tip is farther from wrist than pip (means actually extended outward)
This is MUCH more stable on mobile.
*/
function fingerExtended(hand, tip, pip, mcp, size){
  const wrist = hand[0];
  const Tip = hand[tip], Pip = hand[pip], Mcp = hand[mcp];

  const a = dist(Tip, Mcp);
  const b = dist(Tip, Pip) + dist(Pip, Mcp) + 1e-6;
  const straight = (a / b) > 0.92; // 1.0 = perfectly straight

  const away = dist(Tip, wrist) > dist(Pip, wrist);

  // also require minimum length w.r.t palm size (avoid noise)
  const longEnough = (a / size) > 1.05;

  return straight && away && longEnough;
}

function pinchOn(hand, size){
  // thumb tip 4 and index tip 8
  return (dist(hand[4], hand[8]) / size) < 0.55;
}

// -------- Gesture stability (hold frames) ----------
let holdOne=0, holdTwo=0, holdOpen=0, holdFist=0, holdPinch=0;
let nextCooldown = 0;
let burstCooldown = 0;

function onHandResults(results){
  if (!results?.multiHandLandmarks?.length){
    spread = clamp(spread * 0.995, 0.7, 3.2);
    setDbg(`<b>DEBUG</b><br>No hand detected`);
    return;
  }

  const hand = results.multiHandLandmarks[0];
  const size = palmSize(hand);

  const palm = hand[9];
  targetRotY = (palm.x - 0.5) * 2.6;
  targetRotX = (palm.y - 0.5) * 2.6;

  // ✅ proper finger indices:
  // index: tip8 pip6 mcp5
  // middle: tip12 pip10 mcp9
  // ring: tip16 pip14 mcp13
  // pinky: tip20 pip18 mcp17
  const indexExt = fingerExtended(hand, 8, 6, 5, size);
  const midExt   = fingerExtended(hand,12,10, 9, size);
  const ringExt  = fingerExtended(hand,16,14,13, size);
  const pinkyExt = fingerExtended(hand,20,18,17, size);

  const extCount = [indexExt, midExt, ringExt, pinkyExt].filter(Boolean).length;
  const pinch = pinchOn(hand, size);

  const oneFinger = indexExt && !midExt && !ringExt && !pinkyExt;
  const twoFingers = indexExt && midExt && !ringExt && !pinkyExt;

  const openPalm = extCount >= 3;
  const fist = extCount <= 1 && pinch && !indexExt;

  // holds
  holdOne   = oneFinger ? holdOne+1 : 0;
  holdTwo   = twoFingers ? holdTwo+1 : 0;
  holdOpen  = openPalm ? holdOpen+1 : 0;
  holdFist  = fist ? holdFist+1 : 0;
  holdPinch = pinch ? holdPinch+1 : 0;

  const now = performance.now();

  // open -> expand
  if (holdOpen >= 4){
    spread = clamp(spread + 0.07, 0.7, 3.2);
    hue = lerp(hue, 330, 0.16);
  }

  // fist -> contract
  if (holdFist >= 4){
    spread = clamp(spread - 0.07, 0.7, 3.2);
    hue = lerp(hue, 195, 0.16);
  }

  // pinch -> warm
  if (holdPinch >= 3) hue = lerp(hue, 40, 0.08);
  else hue = lerp(hue, 210, 0.03);

  // ✅ ONE FINGER NEXT (hard stable)
  if (holdOne >= 8 && now > nextCooldown){
    nextCooldown = now + 1100; // stronger cooldown
    applyTemplate(tplIndex + 1);
    holdOne = 0;
  }

  // ✅ TWO FINGER BURST
  if (holdTwo >= 7 && now > burstCooldown){
    burstCooldown = now + 1100;
    doBurst();
    holdTwo = 0;
  }

  // color apply
  const h = (hue % 360) / 360;
  material.color.setHSL(h, 1, 0.55);

  points.scale.set(spread, spread, spread);

  setDbg(`
    <b>DEBUG</b><br>
    index:${indexExt} middle:${midExt} ring:${ringExt} pinky:${pinkyExt}<br>
    extCount:${extCount} pinch:${pinch}<br>
    holdOne:${holdOne} holdTwo:${holdTwo} open:${holdOpen} fist:${holdFist}<br>
    <span style="opacity:.85">Tip: 1 finger ko 1 sec steady rakho</span>
  `);
}

// ---------- Firework burst ----------
function doBurst(){
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
  const t = performance.now()*0.001;
  for(let i=0;i<COUNT;i++){
    const ix = i*3;

    const bx = basePos[ix], by = basePos[ix+1], bz = basePos[ix+2];
    let x = positions[ix], y = positions[ix+1], z = positions[ix+2];

    // spring back
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

    // premium wave motion
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

setStatus("Ready ✅  ☝️1 finger (hold 1 sec) = Next  | ✌️2 finger = Burst");
