import * as THREE from "three";

// GLB loader optional (without extra npm deps)
// We'll dynamically import from three examples via CDN is messy in Next.
// So: if models not found -> fallback boxes.
// When you want full GLB loading, I'll give next step with local loader.

export function createThreeScene({ mountEl }){
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1220);

  const camera = new THREE.PerspectiveCamera(
    60,
    mountEl.clientWidth / mountEl.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.6, 4);

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
  mountEl.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 5, 3);
  scene.add(dir);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x111827 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Player placeholder
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.6, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x22c55e })
  );
  player.position.set(-0.8, 0.8, 0);
  scene.add(player);

  // Bot placeholder
  const bot = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.6, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  bot.position.set(0.8, 0.8, 0);
  scene.add(bot);

  const clock = new THREE.Clock();

  function resize(){
    const w = mountEl.clientWidth;
    const h = mountEl.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render(){
    renderer.render(scene, camera);
  }

  function dispose(){
    renderer.dispose();
    if(renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  return { scene, camera, renderer, player, bot, clock, resize, render, dispose };
}
