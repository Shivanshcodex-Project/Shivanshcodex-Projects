const canvas = document.getElementById("three");
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");
const nextBtn  = document.getElementById("nextBtn");
const statusEl = document.getElementById("status");
const tplPill  = document.getElementById("tplPill");

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(a,b)=>Math.hypot(a.x-b.x, a.y-b.y);

function setStatus(msg){ statusEl.textContent = "Status: " + msg; }

// ------------------ THREE ------------------
const scene = new THREE.Scene();
const camera3D = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 2000);
camera3D.position.z = 7; // little far so object never cuts

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const COUNT = 4200;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT*3);
const basePos   = new Float32Array(COUNT*3);
const velocity  = new Float32Array(COUNT*3);

const material = new THREE.PointsMaterial({
  size: 0.032,
  color: new THREE.Color(0x00d4ff),
  transparent:true,
  opacity:0.95
});

const points = new THREE.Points(geometry, material);
scene.add(points);

let spread = 1;
let targetRotX = 0, targetRotY = 0;
let hue = 200;
let tplIndex = 0;

// ------------------ helpers ------------------
function rand(a,b){ return a + Math.random()*(b-a); }
function setPoint(i,x,y,z){
  positions[i*3]=x; positions[i*3+1]=y; positions[i*3+2]=z;
  basePos[i*3]=x;   basePos[i*3+1]=y;   basePos[i*3+2]=z;
  velocity[i*3]=0; velocity[i*3+1]=0; velocity[i*3+2]=0;
}

// ------------------ Templates ------------------
function buildHeart(){
  for(let i=0;i<COUNT;i++){
    const t=Math.random()*Math.PI*2;
    const x=16*Math.pow(Math.sin(t),3);
    const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
    const s=0.10;
    setPoint(i,x*s,y*s,rand(-0.35,0.35));
  }
}

function buildFlower(){
  const k=6;
  for(let i=0;i<COUNT;i++){
    const t=Math.random()*Math.PI*2;
    const r=Math.cos(k*t);
    setPoint(i,Math.cos(t)*r*2.35, Math.sin(t)*r*2.35, rand(-0.45,0.45));
  }
}

function buildSaturn(){
  for(let i=0;i<COUNT;i++){
    const u=Math.random();
    if(u<0.35){
      const a=Math.random()*Math.PI*2;
      const b=Math.acos(rand(-1,1));
      const r=rand(0.0,0.95);
      setPoint(i,
        r*Math.sin(b)*Math.cos(a)*1.85,
        r*Math.sin(b)*Math.sin(a)*1.85,
        r*Math.cos(b)*1.85
      );
    }else{
      const t=Math.random()*Math.PI*2;
      const r=rand(1.5,2.7);
      setPoint(i, Math.cos(t)*r, rand(-0.08,0.08), Math.sin(t)*r);
    }
  }
}

function buildFireworkSeed(){
  for(let i=0;i<COUNT;i++){
    const a=Math.random()*Math.PI*2;
    const b=Math.acos(rand(-1,1));
    const r=Math.pow(Math.random(),1.9)*0.62;
    setPoint(i,
      r*Math.sin(b)*Math.cos(a),
      r*Math.sin(b)*Math.sin(a),
      r*Math.cos(b)
    );
  }
}

function buildSpiral(){
  for(let i=0;i<COUNT;i++){
    const t=i/COUNT*45;
    const r=0.028*t;
    setPoint(i, Math.cos(t)*r*2.2, (i/COUNT-0.5)*4.0, Math.sin(t)*r*2.2);
  }
}

function buildStar(){
  const spikes=5,R=2.5,r=1.2;
  for(let i=0;i<COUNT;i++){
    const t=Math.random()*Math.PI*2;
    const wob=(Math.cos(spikes*t)+1)*0.5;
    const rad=r+wob*(R-r);
    setPoint(i, Math.cos(t)*rad, Math.sin(t)*rad, rand(-0.35,0.35));
  }
}

function buildButterfly(){
  for(let i=0;i<COUNT;i++){
    const side=Math.random()<0.5?-1:1;
    const t=Math.random()*Math.PI*2;
    const wing=1.2+0.55*Math.cos(2*t);
    const x=side*Math.cos(t)*wing*1.9;
    const y=Math.sin(t)*wing*1.35;
    const z=rand(-0.30,0.30);
    const pinch=1-Math.abs(x)/4.5;
    setPoint(i,x,y,z*pinch);
  }
  const start=Math.floor(COUNT*0.9);
  for(let i=start;i<COUNT;i++){
    setPoint(i, rand(-0.12,0.12), rand(-2.1,2.1), rand(-0.12,0.12));
  }
}

function buildTextPoints(text="ShivanshCodex"){
  const W=900,H=260;
  const c=document.createElement("canvas");
  c.width=W;c.height=H;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#fff";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.font="900 110px system-ui, Arial";
  ctx.fillText(text,W/2,H/2);
  const img=ctx.getImageData(0,0,W,H).data;
  const pts=[];
  const step=3;
  for(let y=0;y<H;y+=step){
    for(let x=0;x<W;x+=step){
      const idx=(y*W+x)*4;
      if(img[idx+3]>60) pts.push({x,y});
    }
  }
  for(let i=0;i<COUNT;i++){
    const p=pts[(Math.random()*pts.length)|0] || {x:W/2,y:H/2};
    setPoint(i, (p.x/W-0.5)*6.2, (0.5-p.y/H)*2.1, rand(-0.25,0.25));
  }
}

const Templates = [
  { name:"Heart", build:buildHeart, fit: 2.6 },
  { name:"Flower", build:buildFlower, fit: 2.9 },
  { name:"Saturn", build:buildSaturn, fit: 3.2 },
  { name:"Firework", build:buildFireworkSeed, fit: 2.3 },
  { name:"Spiral", build:buildSpiral, fit: 3.0 },
  { name:"Star", build:buildStar, fit: 3.2 },
  { name:"Butterfly", build:buildButterfly, fit: 3.0 },
  { name:"Text: ShivanshCodex", build:() => buildTextPoints("ShivanshCodex"), fit: 3.4 },
];

function fitCameraToTemplate(){
  // ✅ object cut fix: adjust camera z based on template "fit"
  const f = Templates[tplIndex].fit || 3.0;
  camera3D.position.z = 4.8 + f; // tuned
}

function applyTemplate(i){
  tplIndex=(i+Templates.length)%Templates.length;
  tplPill.textContent = "Template: " + Templates[tplIndex].name;

  Templates[tplIndex].build();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions,3));
  geometry.attributes.position.needsUpdate = true;

  fitCameraToTemplate();
  setStatus(`Template loaded ✅ (${Templates[tplIndex].name})`);
}
applyTemplate(0);

// ------------------ MediaPipe ------------------
let hands=null, running=false, rafId=null, stream=null;

// gesture smoothing
let pinchSmooth = 999;

function palmSize(hand){
  return dist(hand[0], hand[9]) + 1e-6;
}
function extScore(hand, tipIdx, pipIdx, size){
  const wrist = hand[0];
  return (dist(hand[tipIdx], wrist) - dist(hand[pipIdx], wrist)) / size;
}
function isExt(hand, tipIdx, pipIdx, size){
  // ✅ easier threshold
  return extScore(hand, tipIdx, pipIdx, size) > 0.12;
}

// ✅ pinch: super sensitive
function isPinch(hand, size){
  const raw = (dist(hand[4], hand[8]) / size); // smaller = pinch
  pinchSmooth = lerp(pinchSmooth, raw, 0.55);
  return pinchSmooth < 1.05; // ✅ very relaxed for mobile
}

// ✅ fist: fingertips near palm
function isFist(hand, size){
  const palm = hand[9];
  const tips = [8,12,16,20];
  const avg = tips.reduce((s,i)=>s + dist(hand[i], palm), 0) / tips.length;
  return (avg/size) < 1.18;
}

let holdOpen=0, holdFist=0, holdTwo=0, holdPinch=0, holdOne=0;
let nextCooldown=0, burstCooldown=0;

function setupHands(){
  if(typeof Hands==="undefined"){ setStatus("MediaPipe Hands not loaded."); return false; }
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

function onHandResults(results){
  if(!results?.multiHandLandmarks?.length){
    // if no hand, don't break everything
    spread = clamp(spread*0.995, 0.7, 3.2);
    return;
  }

  const hand = results.multiHandLandmarks[0];
  const size = palmSize(hand);

  // movement
  const palm = hand[9];
  targetRotY = (palm.x - 0.5) * 2.5;
  targetRotX = (palm.y - 0.5) * 2.5;

  // fingers ext
  const indexExt = isExt(hand, 8, 6, size);
  const midExt   = isExt(hand,12,10,size);
  const ringExt  = isExt(hand,16,14,size);
  const pinkyExt = isExt(hand,20,18,size);
  const extCount = [indexExt, midExt, ringExt, pinkyExt].filter(Boolean).length;

  const pinch = isPinch(hand, size);
  const fist  = isFist(hand, size); // fist independent now
  const open  = extCount >= 3;

  const two   = indexExt && midExt && !ringExt && !pinkyExt;
  const one   = indexExt && !midExt && !ringExt && !pinkyExt;

  // holds
  holdOpen  = open ? holdOpen+1 : 0;
  holdFist  = fist ? holdFist+1 : 0;
  holdTwo   = two  ? holdTwo+1 : 0;
  holdPinch = pinch? holdPinch+1: 0;
  holdOne   = one  ? holdOne+1 : 0;

  const now = performance.now();

  // open -> expand
  if(holdOpen >= 3){
    spread = clamp(spread + 0.08, 0.7, 3.2);
  }

  // fist -> contract
  if(holdFist >= 3){
    spread = clamp(spread - 0.08, 0.7, 3.2);
  }

  // pinch -> strong color shift
  if(holdPinch >= 1){
    const t = clamp((1.05 - pinchSmooth) / 0.65, 0, 1);
    const targetHue = lerp(210, 12, t); // blue -> orange/red
    hue = lerp(hue, targetHue, 0.22);
  }else{
    hue = lerp(hue, 200, 0.05);
  }

  // one finger -> next
  if(holdOne >= 6 && now > nextCooldown){
    nextCooldown = now + 900;
    applyTemplate(tplIndex + 1);
    holdOne = 0;
  }

  // two finger -> burst
  if(holdTwo >= 5 && now > burstCooldown){
    burstCooldown = now + 900;
    doBurst();
    holdTwo = 0;
  }

  // apply
  const h = (hue % 360) / 360;
  material.color.setHSL(h, 1, 0.55);
  points.scale.set(spread, spread, spread);
}

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
      video: { facingMode:"user", width:{ideal:640}, height:{ideal:480} },
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

  if(stream){
    stream.getTracks().forEach(t=>t.stop());
    stream=null;
  }
  video.srcObject=null;
  setStatus("Camera OFF");
}

startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);
nextBtn.addEventListener("click", ()=> applyTemplate(tplIndex+1));

// ------------------ physics & render ------------------
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

    // premium motion
    x += Math.sin(t + i*0.01) * 0.0009;
    y += Math.cos(t + i*0.012)* 0.0009;

    positions[ix]=x; positions[ix+1]=y; positions[ix+2]=z;
  }
  geometry.attributes.position.needsUpdate=true;
}

function animate(){
  requestAnimationFrame(animate);

  points.rotation.y += (targetRotY - points.rotation.y) * 0.12;
  points.rotation.x += (targetRotX - points.rotation.x) * 0.12;
  points.rotation.z += 0.0016;

  updateParticles();
  renderer.render(scene, camera3D);
}
animate();

addEventListener("resize", ()=>{
  camera3D.aspect = innerWidth/innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
