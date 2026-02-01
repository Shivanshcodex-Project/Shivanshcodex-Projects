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

// ---------- Templates (same) ----------
function buildHeart(){ for(let i=0;i<COUNT;i++){ const t=Math.random()*Math.PI*2;
  const x=16*Math.pow(Math.sin(t),3);
  const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
  const s=0.09; setPoint(i,x*s,y*s,rand(-0.4,0.4)); } }
function buildFlower(){ const k=6; for(let i=0;i<COUNT;i++){ const t=Math.random()*Math.PI*2;
  const r=Math.cos(k*t); const x=r*Math.cos(t), y=r*Math.sin(t);
  setPoint(i,x*2.3,y*2.3,rand(-0.55,0.55)); } }
function buildSaturn(){ for(let i=0;i<COUNT;i++){ const u=Math.random();
  if(u<0.34){ const a=Math.random()*Math.PI*2; const b=Math.acos(rand(-1,1)); const r=rand(0.0,0.95);
    const x=r*Math.sin(b)*Math.cos(a), y=r*Math.sin(b)*Math.sin(a), z=r*Math.cos(b);
    setPoint(i,x*1.8,y*1.8,z*1.8);
  } else { const t=Math.random()*Math.PI*2; const r=rand(1.45,2.55);
    setPoint(i,Math.cos(t)*r,rand(-0.09,0.09),Math.sin(t)*r); } } }
function buildFireworkSeed(){ for(let i=0;i<COUNT;i++){ const a=Math.random()*Math.PI*2; const b=Math.acos(rand(-1,1));
  const r=Math.pow(Math.random(),1.9)*0.62; const x=r*Math.sin(b)*Math.cos(a), y=r*Math.sin(b)*Math.sin(a), z=r*Math.cos(b);
  setPoint(i,x,y,z); } }
function buildSpiral(){ for(let i=0;i<COUNT;i++){ const t=i/COUNT*45; const r=0.028*t;
  setPoint(i,Math.cos(t)*r*2.2,(i/COUNT-0.5)*4.2,Math.sin(t)*r*2.2); } }
function buildStar(){ const spikes=5,R=2.4,r=1.1; for(let i=0;i<COUNT;i++){ const t=Math.random()*Math.PI*2;
  const wob=(Math.cos(spikes*t)+1)*0.5; const rad=r+wob*(R-r);
  setPoint(i,Math.cos(t)*rad,Math.sin(t)*rad,rand(-0.45,0.45)); } }
function buildButterfly(){ for(let i=0;i<COUNT;i++){ const side=Math.random()<0.5?-1:1; const t=Math.random()*Math.PI*2;
  const wing=1.2+0.55*Math.cos(2*t); const x=side*Math.cos(t)*wing*1.9; const y=Math.sin(t)*wing*1.35;
  const z=rand(-0.35,0.35); const pinch=1-Math.abs(x)/4.5; setPoint(i,x,y,z*pinch); }
  const start=Math.floor(COUNT*0.9); for(let i=start;i<COUNT;i++){ setPoint(i,rand(-0.12,0.12),rand(-2.2,2.2),rand(-0.12,0.12)); } }
function buildTextPoints(text="ShivanshCodex"){
  const W=900,H=260,c=document.createElement("canvas"); c.width=W;c.height=H; const ctx=c.getContext("2d");
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.font="900 110px system-ui, Arial"; ctx.fillText(text,W/2,H/2);
  const img=ctx.getImageData(0,0,W,H).data; const pts=[]; const step=3;
  for(let y=0;y<H;y+=step){ for(let x=0;x<W;x+=step){ const idx=(y*W+x)*4; if(img[idx+3]>50) pts.push({x,y}); } }
  for(let i=0;i<COUNT;i++){ const p=pts[(Math.random()*pts.length)|0]||{x:W/2,y:H/2};
    setPoint(i,(p.x/W-0.5)*6.0,(0.5-p.y/H)*2.0,rand(-0.28,0.28)); }
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

let tplIndex=0;
function applyTemplate(i){
  tplIndex=(i+Templates.length)%Templates.length;
  tplPill.textContent="Template: "+Templates[tplIndex].name;
  Templates[tplIndex].build();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions,3));
  geometry.attributes.position.needsUpdate=true;
  setStatus(`Template loaded ✅ (${Templates[tplIndex].name})`);
}
applyTemplate(0);

// ---------- MediaPipe ----------
let hands=null, running=false, rafId=null, stream=null;

function setupHands(){
  if(typeof Hands==="undefined"){ setStatus("MediaPipe Hands not loaded."); return false; }
  hands = new Hands({ locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
  hands.setOptions({ maxNumHands:1, modelComplexity:1, minDetectionConfidence:0.7, minTrackingConfidence:0.7 });
  hands.onResults(onHandResults);
  return true;
}

// ---------- NEW gesture detection (relaxed & stable) ----------
function palmSize(hand){
  // wrist(0) to middle_mcp(9)
  return dist(hand[0], hand[9]) + 1e-6;
}

// extension score based on distances to wrist (more stable)
function extScore(hand, tipIdx, pipIdx, size){
  const wrist = hand[0];
  const tip = hand[tipIdx];
  const pip = hand[pipIdx];
  // if tip is much farther from wrist than pip => extended
  return (dist(tip, wrist) - dist(pip, wrist)) / size; // positive = extended
}
function isExt(hand, tipIdx, pipIdx, size){
  return extScore(hand, tipIdx, pipIdx, size) > 0.15; // ✅ relaxed threshold
}

// pinch (thumb-index) relaxed + smoothing
let pinchSmooth = 1;
function isPinch(hand, size){
  const raw = (dist(hand[4], hand[8]) / size); // smaller => pinch
  pinchSmooth = lerp(pinchSmooth, raw, 0.35);
  return pinchSmooth < 0.70; // ✅ relaxed
}

// fist detection: fingertips close to palm center (9)
function isFist(hand, size){
  const palm = hand[9];
  const tips = [8,12,16,20].map(i=>hand[i]);
  const avg = tips.reduce((s,p)=>s+dist(p,palm),0)/tips.length;
  return (avg/size) < 1.15; // ✅ if tips are near palm => fist
}

let holdOpen=0, holdFist=0, holdTwo=0, holdPinch=0, holdOne=0;
let nextCooldown=0, burstCooldown=0;

function onHandResults(results){
  if(!results?.multiHandLandmarks?.length){
    setDbg(`<b>DEBUG</b><br>No hand detected`);
    spread = clamp(spread*0.995,0.7,3.2);
    return;
  }

  const hand = results.multiHandLandmarks[0];
  const size = palmSize(hand);

  const palm = hand[9];
  targetRotY = (palm.x - 0.5) * 2.6;
  targetRotX = (palm.y - 0.5) * 2.6;

  // extension
  const indexExt = isExt(hand, 8, 6, size);
  const midExt   = isExt(hand,12,10,size);
  const ringExt  = isExt(hand,16,14,size);
  const pinkyExt = isExt(hand,20,18,size);

  const extCount = [indexExt, midExt, ringExt, pinkyExt].filter(Boolean).length;

  const pinch = isPinch(hand, size);
  const fist  = isFist(hand, size) && pinch;          // ✅ fist = tips near palm + pinch-ish
  const open  = extCount >= 3 && !fist;               // ✅ open = 3+ fingers extended
  const two   = indexExt && midExt && !ringExt && !pinkyExt;
  const one   = indexExt && !midExt && !ringExt && !pinkyExt;

  // holds
  holdOpen  = open ? holdOpen+1 : 0;
  holdFist  = fist ? holdFist+1 : 0;
  holdTwo   = two  ? holdTwo+1 : 0;
  holdPinch = pinch? holdPinch+1: 0;
  holdOne   = one  ? holdOne+1 : 0;

  const now = performance.now();

  // ✅ open -> expand
  if(holdOpen >= 3){
    spread = clamp(spread + 0.08, 0.7, 3.2);
    hue = lerp(hue, 320, 0.16);
  }

  // ✅ fist -> contract
  if(holdFist >= 3){
    spread = clamp(spread - 0.08, 0.7, 3.2);
    hue = lerp(hue, 195, 0.16);
  }

  // ✅ pinch -> warm hue (color control)
  if(holdPinch >= 2) hue = lerp(hue, 35, 0.10);
  else hue = lerp(hue, 210, 0.04);

  // ✅ one finger -> next (still works)
  if(holdOne >= 6 && now > nextCooldown){
    nextCooldown = now + 900;
    applyTemplate(tplIndex + 1);
    holdOne = 0;
  }

  // ✅ two fingers -> burst
  if(holdTwo >= 5 && now > burstCooldown){
    burstCooldown = now + 900;
    doBurst();
    holdTwo = 0;
  }

  // apply color
  const h = (hue % 360) / 360;
  material.color.setHSL(h, 1, 0.55);

  points.scale.set(spread, spread, spread);

  setDbg(`
    <b>DEBUG</b><br>
    index:${indexExt} mid:${midExt} ring:${ringExt} pinky:${pinkyExt} (count:${extCount})<br>
    pinch:${pinch} (smooth:${pinchSmooth.toFixed(2)}) fist:${fist} open:${open} two:${two} one:${one}<br>
    holdOpen:${holdOpen} holdFist:${holdFist} holdTwo:${holdTwo} holdPinch:${holdPinch}
  `);
}

// ---------- Firework burst ----------
function doBurst(){
  for(let i=0;i<COUNT;i++){
    const x=positions[i*3], y=positions[i*3+1], z=positions[i*3+2];
    const len=Math.hypot(x,y,z) || 1;
    velocity[i*3]   += (x/len) * rand(0.02,0.07);
    velocity[i*3+1] += (y/len) * rand(0.02,0.07);
    velocity[i*3+2] += (z/len) * rand(0.02,0.07);
  }
  setStatus("Firework burst 🎆 (✌️ two fingers)");
}

// ---------- loop ----------
async function loop(){
  if(!running) return;
  try{ await hands.send({ image: video }); }
  catch(e){ setStatus("Hands error: " + (e?.message || e)); }
  rafId = requestAnimationFrame(loop);
}

async function startCamera(){
  setStatus("Requesting camera permission…");
  if(!navigator.mediaDevices?.getUserMedia){ setStatus("getUserMedia not supported"); return; }
  if(!hands){ if(!setupHands()) return; }
  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:"user", width:{ideal:640}, height:{ideal:480} },
      audio:false
    });
    video.srcObject = stream;
    await video.play();

    running = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;

    setStatus("Camera ON ✅ Hand tracking running…");
    loop();
  }catch(err){
    setStatus("Camera denied/blocked: " + (err?.name||"") + " " + (err?.message||""));
  }
}

function stopCamera(){
  running=false;
  startBtn.disabled=false;
  stopBtn.disabled=true;
  if(rafId) cancelAnimationFrame(rafId);
  rafId=null;
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  video.srcObject=null;
  setStatus("Camera OFF");
}

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);
nextBtn.addEventListener("click", ()=> applyTemplate(tplIndex+1));

// ---------- physics ----------
function updateParticles(){
  const t = performance.now()*0.001;
  for(let i=0;i<COUNT;i++){
    const ix=i*3;
    const bx=basePos[ix], by=basePos[ix+1], bz=basePos[ix+2];
    let x=positions[ix], y=positions[ix+1], z=positions[ix+2];

    const spring=0.020;
    velocity[ix]   += (bx-x)*spring;
    velocity[ix+1] += (by-y)*spring;
    velocity[ix+2] += (bz-z)*spring;

    const damp=0.885;
    velocity[ix]   *= damp;
    velocity[ix+1] *= damp;
    velocity[ix+2] *= damp;

    x += velocity[ix];
    y += velocity[ix+1];
    z += velocity[ix+2];

    x += Math.sin(t + i*0.01)*0.0009;
    y += Math.cos(t + i*0.012)*0.0009;

    positions[ix]=x; positions[ix+1]=y; positions[ix+2]=z;
  }
  geometry.attributes.position.needsUpdate=true;
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

addEventListener("resize", ()=>{
  camera3D.aspect=innerWidth/innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

setStatus("Ready ✅  ✋ open=expand | ✊ fist=contract | ✌️ two=burst | 🤏 pinch=color | ☝️ one=next");
