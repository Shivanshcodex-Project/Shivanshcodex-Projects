const canvas = document.getElementById("three");
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");

function setStatus(msg){
  statusEl.textContent = "Status: " + msg;
}
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

// ---------- THREE ----------
const scene = new THREE.Scene();
const camera3D = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000);
camera3D.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

const COUNT = 2200;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);

for (let i=0;i<COUNT;i++){
  positions[i*3]   = (Math.random() - 0.5) * 3.5;
  positions[i*3+1] = (Math.random() - 0.5) * 3.5;
  positions[i*3+2] = (Math.random() - 0.5) * 3.5;
}
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({ size:0.04, color:0x00d4ff });
const points = new THREE.Points(geometry, material);
scene.add(points);

let spread = 1;
let targetRotX = 0, targetRotY = 0;

// ---------- MediaPipe ----------
let hands = null;
let running = false;
let rafId = null;
let stream = null;

function setupHands(){
  // ✅ if Hands lib not loaded, show error
  if (typeof Hands === "undefined"){
    setStatus("MediaPipe Hands not loaded (CDN blocked). Try different network.");
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

function onHandResults(results){
  if (!results?.multiHandLandmarks?.length){
    spread = clamp(spread * 0.995, 0.7, 3);
    material.color.set(0x00d4ff);
    points.scale.set(spread, spread, spread);
    return;
  }

  const hand = results.multiHandLandmarks[0];
  const palm = hand[9];

  targetRotY = (palm.x - 0.5) * 2.2;
  targetRotX = (palm.y - 0.5) * 2.2;

  const thumb = hand[4];
  const index = hand[8];
  const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);

  if (dist > 0.10){
    spread = clamp(spread + 0.05, 0.7, 3);
    material.color.set(0xff4dd2);
  } else {
    spread = clamp(spread - 0.05, 0.7, 3);
    material.color.set(0x00d4ff);
  }

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

// ---------- Camera ----------
async function startCamera(){
  // ✅ click reached proof
  setStatus("Clicked ✅ Starting…");

  if (!navigator.mediaDevices?.getUserMedia){
    setStatus("getUserMedia not supported");
    return;
  }

  if (!hands){
    const ok = setupHands();
    if (!ok) return;
  }

  try{
    setStatus("Requesting camera permission…");
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

// ---------- render loop ----------
function animate(){
  requestAnimationFrame(animate);
  points.rotation.y += (targetRotY - points.rotation.y) * 0.08;
  points.rotation.x += (targetRotX - points.rotation.x) * 0.08;
  points.rotation.z += 0.0015;
  renderer.render(scene, camera3D);
}
animate();

addEventListener("resize", () => {
  camera3D.aspect = innerWidth/innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

setStatus("Ready (tap Enable Camera)");
