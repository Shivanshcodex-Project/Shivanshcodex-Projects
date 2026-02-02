// MediaPipe hands loader + punch detection
export async function initHandTracking({ videoEl, onState }){
  await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
  await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");

  const Hands = window.Hands;
  const Camera = window.Camera;

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });

  // internal state
  const state = {
    leftZ: null,
    rightZ: null,
    guard: false,
    leftPunchCooldown: 0,
    rightPunchCooldown: 0,
    leftSpeed: 0,
    rightSpeed: 0
  };

  let lastT = performance.now();

  hands.onResults((results) => {
    const now = performance.now();
    const dt = Math.max(0.001, (now - lastT) / 1000);
    lastT = now;

    // cooldown decay
    state.leftPunchCooldown = Math.max(0, state.leftPunchCooldown - dt);
    state.rightPunchCooldown = Math.max(0, state.rightPunchCooldown - dt);

    let leftZ = null;
    let rightZ = null;
    let guard = false;

    if(results.multiHandLandmarks?.length){
      results.multiHandLandmarks.forEach((lm, idx) => {
        const indexTip = lm[8];
        const handed = results.multiHandedness?.[idx]?.label || "Unknown";

        // z: closer to camera tends to be smaller/more negative depending on model
        const z = indexTip.z;

        if(handed === "Left") leftZ = z;
        if(handed === "Right") rightZ = z;

        // simple guard heuristic: hand y upper half
        if(indexTip.y < 0.55) guard = true;
      });
    }

    // detect punch by z delta (sudden forward)
    // We’ll define dz = prev - current. positive means forward thrust (roughly).
    let leftPunch = false;
    let rightPunch = false;

    if(leftZ !== null){
      if(state.leftZ !== null){
        const dz = state.leftZ - leftZ;
        const speed = dz / dt; // bigger = faster forward
        state.leftSpeed = normalizeSpeed(speed);

        if(dz > 0.08 && state.leftPunchCooldown === 0){
          leftPunch = true;
          state.leftPunchCooldown = 0.35;
        }
      }
      state.leftZ = leftZ;
    }

    if(rightZ !== null){
      if(state.rightZ !== null){
        const dz = state.rightZ - rightZ;
        const speed = dz / dt;
        state.rightSpeed = normalizeSpeed(speed);

        if(dz > 0.08 && state.rightPunchCooldown === 0){
          rightPunch = true;
          state.rightPunchCooldown = 0.35;
        }
      }
      state.rightZ = rightZ;
    }

    state.guard = guard;

    onState({
      guard: state.guard,
      leftPunch,
      rightPunch,
      leftSpeed: state.leftSpeed,
      rightSpeed: state.rightSpeed
    });
  });

  const cam = new Camera(videoEl, {
    onFrame: async () => {
      await hands.send({ image: videoEl });
    },
    width: 640,
    height: 480
  });

  cam.start();

  return () => {
    // MediaPipe Camera util doesn’t provide a clean stop always;
    // We'll stop video tracks from outside.
  };
}

function normalizeSpeed(v){
  // rough normalize to 0..1
  // speed can be huge; clamp
  const x = Math.max(0, Math.min(1, v / 3.5));
  return x;
}

function loadScript(src){
  return new Promise((resolve, reject) => {
    if(document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}
