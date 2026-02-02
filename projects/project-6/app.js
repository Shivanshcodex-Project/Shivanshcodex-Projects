// UI
const canvas = document.getElementById("game");
const speedEl = document.getElementById("speed");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const stopBtn  = document.getElementById("stop");

// THREE
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 60);

const camera = new THREE.PerspectiveCamera(
  60,
  innerWidth/innerHeight,
  0.1,
  100
);

// 👇 Dr Driving style camera
camera.position.set(0,6,10);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));

// Lights
scene.add(new THREE.AmbientLight(0xffffff,.6));
const sun = new THREE.DirectionalLight(0xffffff,.8);
sun.position.set(5,10,5);
scene.add(sun);

// ROAD
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(6,200),
  new THREE.MeshStandardMaterial({color:0x222222})
);
road.rotation.x = -Math.PI/2;
road.position.z = -80;
scene.add(road);

// Lane lines
const lineMat = new THREE.MeshBasicMaterial({color:0xffffff});
for(let i=-1;i<=1;i++){
  const l = new THREE.Mesh(
    new THREE.PlaneGeometry(.05,200),
    lineMat
  );
  l.rotation.x=-Math.PI/2;
  l.position.set(i*1.5,0.01,-80);
  scene.add(l);
}

// CAR (clear visible)
const car = new THREE.Mesh(
  new THREE.BoxGeometry(1,0.6,2),
  new THREE.MeshStandardMaterial({color:0xff4444})
);
car.position.y = .3;
scene.add(car);

// GAME STATE
let speed = 0;
let targetSpeed = 0;
let steer = 0;
let targetSteer = 0;
let score = 0;

// HAND TRACKING
let camUtil;
const hands = new Hands({
  locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
});
hands.setOptions({
  maxNumHands:1,
  minDetectionConfidence:.7,
  minTrackingConfidence:.7
});

hands.onResults(res=>{
  if(!res.multiHandLandmarks) return;
  const h = res.multiHandLandmarks[0];

  // steering
  targetSteer = (h[9].x - 0.5) * 3;

  // accelerate / brake
  const open =
    h[8].y < h[6].y &&
    h[12].y < h[10].y;

  const fist =
    h[8].y > h[6].y &&
    h[12].y > h[10].y;

  if(open) targetSpeed = 16;
  if(fist) targetSpeed = 0;
});

// CAMERA START
startBtn.onclick = async ()=>{
  const stream = await navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user"}
  });
  const video = document.createElement("video");
  video.srcObject = stream;
  video.play();

  camUtil = new Camera(video,{
    onFrame: async()=> hands.send({image:video})
  });
  camUtil.start();

  startBtn.disabled = true;
  stopBtn.disabled  = false;
  statusEl.textContent = "Camera ON";
};

stopBtn.onclick = ()=>{
  camUtil.stop();
  startBtn.disabled = false;
  stopBtn.disabled  = true;
  statusEl.textContent = "Stopped";
};

// LOOP
function animate(){
  requestAnimationFrame(animate);

  steer += (targetSteer - steer)*.1;
  speed += (targetSpeed - speed)*.05;

  car.position.x = THREE.MathUtils.clamp(steer,-2,2);
  car.rotation.y = steer*.1;

  road.position.z += speed*.05;
  if(road.position.z > 0) road.position.z = -80;

  score += speed*.02;

  speedEl.textContent = speed.toFixed(0);
  scoreEl.textContent = score.toFixed(0);

  renderer.render(scene,camera);
}
animate();

onresize = ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
};
