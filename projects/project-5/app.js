const canvas = document.getElementById("three");
const scene = new THREE.Scene();

const camera3D = new THREE.PerspectiveCamera(
  60, window.innerWidth/window.innerHeight, 0.1, 1000
);
camera3D.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);

// ===== PARTICLES =====
const COUNT = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(COUNT * 3);

for(let i=0;i<COUNT;i++){
  positions[i*3]   = (Math.random()-.5)*3;
  positions[i*3+1] = (Math.random()-.5)*3;
  positions[i*3+2] = (Math.random()-.5)*3;
}
geometry.setAttribute("position", new THREE.BufferAttribute(positions,3));

const material = new THREE.PointsMaterial({
  size:0.04,
  color:0x00d4ff
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// ===== MEDIA PIPE HANDS =====
const video = document.getElementById("video");

const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands:1,
  modelComplexity:1,
  minDetectionConfidence:0.7,
  minTrackingConfidence:0.7
});

hands.onResults(onHand);

let spread = 1;

function onHand(results){
  if(!results.multiHandLandmarks) return;

  const hand = results.multiHandLandmarks[0];
  const palm = hand[9]; // center

  // move particles with hand
  particles.rotation.y = (palm.x - 0.5) * 2;
  particles.rotation.x = (palm.y - 0.5) * 2;

  // open palm vs fist (simple logic)
  const thumb = hand[4];
  const index = hand[8];

  const distance = Math.hypot(
    thumb.x - index.x,
    thumb.y - index.y
  );

  if(distance > 0.1){
    spread += 0.05; // open hand
    material.color.set(0xff4dd2); // heart color
  }else{
    spread -= 0.05; // fist
    material.color.set(0x00d4ff);
  }

  spread = Math.min(Math.max(spread,0.5),3);
  particles.scale.set(spread,spread,spread);
}

// ===== CAMERA START =====
document.getElementById("startBtn").onclick = () => {
  const cam = new Camera(video,{
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width:640,
    height:480
  });
  cam.start();
};

// ===== ANIMATE =====
function animate(){
  requestAnimationFrame(animate);
  particles.rotation.z += 0.001;
  renderer.render(scene,camera3D);
}
animate();

window.onresize = () => {
  camera3D.aspect = innerWidth/innerHeight;
  camera3D.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
};
