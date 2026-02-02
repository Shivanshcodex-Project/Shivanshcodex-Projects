// ---------- UI ----------
const canvas = document.getElementById("game");
const speedEl = document.getElementById("speed");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const stopBtn  = document.getElementById("stop");

// ---------- THREE ----------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x020914, 5, 40);

const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth / innerHeight,
  0.1,
  100
);
camera.position.set(0,4,8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias:true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));

// Lights
scene.add(new THREE.HemisphereLight(0x66ccff,0x020914,1.2));
const dir = new THREE.DirectionalLight(0xffffff,0.8);
dir.position.set(5,10,5);
scene.add(dir);

// ---------- ROAD ----------
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(6,200),
  new THREE.MeshStandardMaterial({color:0x071c2d})
);
road.rotation.x = -Math.PI/2;
road.position.z = -80;
scene.add(road);

// lane lines
const lineMat = new THREE.MeshBasicMaterial({color:0x00d4ff});
for(let i=-1;i<=1;i++){
  const l = new THREE.Mesh(
    new THREE.PlaneGeometry(.05,200),
    lineMat
  );
  l.rotation.x=-Math.PI/2;
  l.position.set(i*1.5,0.01,-80);
  scene.add(l);
}

// ---------- CAR (VISIBLE BOX) ----------
const car = new THREE.Mesh(
  new THREE.BoxGeometry(1,.5,2),
  new THREE.MeshStandardMaterial({color:0x00e5ff})
);
car.position.y = .25;
scene.add(car);

// ---------- GAME STATE ----------
let speed = 0;
let targetSpeed = 0;
let steer = 0;
let targetSteer = 0;
let score = 0;

// ---------- HAND TRACKING ----------
let cameraUtil;
const hands = new Hands({
  locateFile: f =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});

hands.setOptions({
  maxNumHands:1,
  minDetectionConfidence:.7,
  minTrackingConfidence:.7
});

hands.onResults(res=>{
  if(!res.multiHandLandmarks) return;

  const h = res.multiHandLandmarks[0];

  // steering (palm x)
  targetSteer = (h[9].x - .5) * 3;

  // open vs fist
  const open =
    h[8].y < h[6].y &&
    h[12].y < h[10].y;

  const fist =
    h[8].y > h[6].y &&
    h[12].y > h[10].y;

  if(open) targetSpeed = 18;
  if(fist) targetSpeed = 0;
});

// ---------- CAMERA CONTROL ----------
startBtn.onclick = async ()=>{
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user"}
  });
  const video = document.createElement("video");
  video.srcObject = stream;
  video.play();

  cameraUtil = new Camera(video,{
    onFrame: async()=> hands.send({image:video})
  });
  cameraUtil.start();

  startBtn.disabled = true;
  stopBtn.disabled  = false;
  statusEl.textContent = "Camera ON";
};

stopBtn.onclick = ()=>{
  cameraUtil.stop();
  startBtn.disabled = false;
  stopBtn.disabled  = true;
  statusEl.textContent = "Stopped";
};

// ---------- LOOP ----------
function animate(){
  requestAnimationFrame(animate);

  steer += (targetSteer - steer)*.1;
  speed += (targetSpeed - speed)*.05;

  car.position.x = THREE.MathUtils.clamp(steer,-1.8,1.8);
  car.rotation.z = -steer*.2;

  road.position.z += speed*.05;
  if(road.position.z > 0) road.position.z = -80;

  score += speed*.01;

  speedEl.textContent = speed.toFixed(0);
  scoreEl.textContent = score.toFixed(0);

  renderer.render(scene,camera);
}
animate();

// resize
onresize = ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
};
