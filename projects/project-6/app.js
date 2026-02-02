// ---------- BASIC SETUP ----------
const canvas = document.getElementById("c");
const video = document.getElementById("video");

const startBtn = document.getElementById("start");
const stopBtn  = document.getElementById("stop");

const spdEl = document.getElementById("spd");
const lvlEl = document.getElementById("lvl");
const scrEl = document.getElementById("scr");
const stateEl = document.getElementById("state");

let speed=0, targetSpeed=0, score=0, level=1;
let steer=0, steerTarget=0;
let drifting=false;

// ---------- THREE ----------
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050b12,10,60);

const cam = new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,200);
cam.position.set(0,4,8);

const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));

// lights
scene.add(new THREE.HemisphereLight(0x88dfff,0x050b12,1.2));
const dl = new THREE.DirectionalLight(0xffffff,.8);
dl.position.set(5,10,6);
scene.add(dl);

// road
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(8,200),
  new THREE.MeshStandardMaterial({color:0x071b2a})
);
road.rotation.x=-Math.PI/2;
road.position.z=-80;
scene.add(road);

// lanes
const lanes=[-1.6,0,1.6];

// ---------- CAR (GLB) ----------
let car;
const loader = new THREE.GLTFLoader();
loader.load("./assets/car.glb",g=>{
  car=g.scene;
  car.scale.set(1.2,1.2,1.2);
  car.position.y=0.05;
  scene.add(car);
});

// neon wheels glow
const glow = new THREE.Mesh(
  new THREE.RingGeometry(.8,1.2,32),
  new THREE.MeshBasicMaterial({color:0x00d4ff,transparent:true,opacity:.25})
);
glow.rotation.x=-Math.PI/2;
glow.position.y=0.02;
scene.add(glow);

// ---------- TRAFFIC AI ----------
const traffic=[];
const tMat=new THREE.MeshStandardMaterial({color:0x4a0b1e});
function spawnCar(z){
  const c=new THREE.Mesh(
    new THREE.BoxGeometry(1,.5,2),
    tMat
  );
  c.position.set(lanes[Math.floor(Math.random()*3)],.25,z);
  scene.add(c);
  traffic.push(c);
}
for(let i=0;i<6;i++)spawnCar(-10-i*12);

// ---------- SOUNDS ----------
const engine=new Audio("./assets/engine.mp3");
engine.loop=true;
const driftS=new Audio("./assets/drift.mp3");
const crashS=new Audio("./assets/crash.mp3");

// ---------- HAND TRACKING ----------
let hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
hands.setOptions({maxNumHands:2,minDetectionConfidence:.7,minTrackingConfidence:.7});
hands.onResults(res=>{
  if(!res.multiHandLandmarks)return;

  res.multiHandLandmarks.forEach(h=>{
    const palm=h[9], wrist=h[0];
    const size=Math.hypot(palm.x-wrist.x,palm.y-wrist.y);

    // LEFT = steering
    steerTarget=(palm.x-.5)*2;

    // RIGHT = speed + drift
    const open = h[8].y < h[6].y && h[12].y < h[10].y;
    const fist = h[8].y > h[6].y && h[12].y > h[10].y;

    const pinch = Math.hypot(
      h[4].x-h[8].x,
      h[4].y-h[8].y
    ) < size*.4;

    if(open) targetSpeed=20+level*2;
    else if(fist) targetSpeed=0;

    drifting=pinch;
  });
});

let camUtil;
startBtn.onclick=async()=>{
  const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"}});
  video.srcObject=stream;
  camUtil=new Camera(video,{onFrame:async()=>hands.send({image:video})});
  camUtil.start();

  engine.play();
  startBtn.disabled=true;
  stopBtn.disabled=false;
  stateEl.textContent="Camera ON";
};

stopBtn.onclick=()=>{
  camUtil.stop();
  engine.pause();
  startBtn.disabled=false;
  stopBtn.disabled=true;
};

// ---------- GAME LOOP ----------
function animate(){
  requestAnimationFrame(animate);

  steer+= (steerTarget-steer)*.1;
  speed+= (targetSpeed-speed)*.05;

  if(car){
    car.position.x = THREE.MathUtils.clamp(steer*1.6,-1.6,1.6);
    car.rotation.z = drifting ? -steer*.4 : -steer*.2;
  }

  glow.position.x = car?car.position.x:0;

  traffic.forEach(t=>{
    t.position.z += speed*.06;
    if(t.position.z>6){
      t.position.z=-80;
      t.position.x=lanes[Math.floor(Math.random()*3)];
      score+=10;
    }
    if(car && Math.abs(t.position.z-car.position.z)<1.5 &&
       Math.abs(t.position.x-car.position.x)<.8){
      crashS.play();
      speed=0;targetSpeed=0;
    }
  });

  if(score>level*200){level++;lvlEl.textContent=level;}

  spdEl.textContent=Math.round(speed);
  scrEl.textContent=score;

  renderer.render(scene,cam);
}
animate();

window.onresize=()=>{
  cam.aspect=innerWidth/innerHeight;
  cam.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
};
