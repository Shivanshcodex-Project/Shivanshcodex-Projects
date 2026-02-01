const basicBox = document.getElementById("basicBox");
const deviceBox = document.getElementById("deviceBox");
const netBox = document.getElementById("netBox");
const permBox = document.getElementById("permBox");
const gpsBox = document.getElementById("gpsBox");

const refreshBtn = document.getElementById("refreshBtn");
const copyAllBtn = document.getElementById("copyAllBtn");
const ipBtn = document.getElementById("ipBtn");
const ipGeoBtn = document.getElementById("ipGeoBtn");
const gpsBtn = document.getElementById("gpsBtn");
const camBtn = document.getElementById("camBtn");

const toast = document.getElementById("toast");

let report = {
  basic: {},
  device: {},
  network: {},
  permissions: {},
  ip: null,
  ipGeo: null,
  gps: null
};

function showToast(t){
  toast.textContent = t;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 1500);
}

function kvHTML(obj){
  return Object.entries(obj).map(([k,v]) => `
    <div class="k">${escapeHtml(k)}</div>
    <div class="v">${escapeHtml(String(v))}</div>
  `).join("");
}

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function setBoxes(){
  basicBox.innerHTML  = kvHTML(report.basic);
  deviceBox.innerHTML = kvHTML(report.device);
  netBox.innerHTML    = kvHTML({...report.network, "Public IP (optional)": report.ip ?? "Not fetched"});
  permBox.innerHTML   = kvHTML(report.permissions);

  gpsBox.textContent = report.gps
    ? `GPS: ${report.gps.lat}, ${report.gps.lon} (±${report.gps.acc}m)`
    : "GPS not requested.";
}

function collect(){
  const d = new Date();

  report.basic = {
    "Page URL": location.href,
    "Time (Local)": d.toString(),
    "Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    "Language": navigator.language || "Unknown",
    "Languages": (navigator.languages || []).join(", ") || "Unknown"
  };

  report.device = {
    "User Agent": navigator.userAgent || "Unknown",
    "Platform": navigator.platform || "Unknown",
    "CPU Cores": navigator.hardwareConcurrency || "Unknown",
    "Device Memory (GB)": navigator.deviceMemory || "Unknown",
    "Screen": `${screen.width} × ${screen.height}`,
    "Viewport": `${window.innerWidth} × ${window.innerHeight}`,
    "Pixel Ratio": window.devicePixelRatio || 1
  };

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  report.network = {
    "Online": navigator.onLine ? "Yes" : "No",
    "Connection": conn?.effectiveType || "Not supported",
    "Downlink (Mbps)": conn?.downlink ?? "Not supported",
    "RTT (ms)": conn?.rtt ?? "Not supported",
    "Save-Data": conn?.saveData ? "Yes" : "No"
  };
}

async function permissionsState(){
  // Permissions API isn’t supported everywhere—handle gracefully
  const out = {};
  if (!navigator.permissions?.query){
    out["Permissions API"] = "Not supported";
    report.permissions = out;
    return;
  }

  const names = ["geolocation", "camera", "microphone", "notifications"];
  for (const name of names){
    try{
      const res = await navigator.permissions.query({ name });
      out[name] = res.state; // granted / denied / prompt
    }catch{
      out[name] = "Not supported";
    }
  }
  report.permissions = out;
}

async function getIP(){
  // Public IP via a public endpoint (privacy awareness)
  const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
  const data = await res.json();
  report.ip = data?.ip || null;
  setBoxes();
  showToast("Public IP fetched");
}

async function getIPGeo(){
  // Approx IP location (rough). If blocked, show message.
  if (!report.ip){
    showToast("First fetch Public IP");
    return;
  }
  const res = await fetch(`https://ipapi.co/${encodeURIComponent(report.ip)}/json/`, { cache: "no-store" });
  const data = await res.json();
  report.ipGeo = data;

  const extra = {
    "IP Approx City": data?.city || "Unknown",
    "IP Approx Region": data?.region || "Unknown",
    "IP Approx Country": data?.country_name || "Unknown",
    "ASN/Org": data?.org || "Unknown"
  };

  netBox.innerHTML = kvHTML({
    ...report.network,
    "Public IP": report.ip,
    ...extra
  });

  showToast("Approx location fetched");
}

function requestGPS(){
  if (!navigator.geolocation){
    showToast("Geolocation not supported");
    return;
  }

  showToast("Requesting GPS…");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      report.gps = {
        lat: pos.coords.latitude.toFixed(6),
        lon: pos.coords.longitude.toFixed(6),
        acc: Math.round(pos.coords.accuracy)
      };
      setBoxes();
      showToast("GPS granted ✅");
    },
    (err) => {
      report.gps = null;
      setBoxes();
      showToast(err.message || "GPS denied");
    },
    { enableHighAccuracy: true, timeout: 12000 }
  );
}

async function checkCameraPerm(){
  if (!navigator.permissions?.query){
    showToast("Permissions API not supported");
    return;
  }
  try{
    const r = await navigator.permissions.query({ name: "camera" });
    showToast(`Camera permission: ${r.state}`);
    await permissionsState();
    setBoxes();
  }catch{
    showToast("Camera permission check not supported");
  }
}

function copyReport(){
  const text =
`Privacy & Device Info Report
===========================
BASIC:
${JSON.stringify(report.basic, null, 2)}

DEVICE:
${JSON.stringify(report.device, null, 2)}

NETWORK:
${JSON.stringify(report.network, null, 2)}

PERMISSIONS:
${JSON.stringify(report.permissions, null, 2)}

PUBLIC IP (optional):
${report.ip || "Not fetched"}

GPS (consent):
${report.gps ? JSON.stringify(report.gps, null, 2) : "Not requested"}
`;
  navigator.clipboard?.writeText(text)
    .then(()=> showToast("Copied ✅"))
    .catch(()=> showToast("Copy not supported"));
}

async function init(){
  collect();
  await permissionsState();
  setBoxes();
}

refreshBtn.addEventListener("click", init);
copyAllBtn.addEventListener("click", copyReport);
ipBtn.addEventListener("click", () => getIP().catch(()=> showToast("IP fetch blocked")));
ipGeoBtn.addEventListener("click", () => getIPGeo().catch(()=> showToast("IP geo blocked")));
gpsBtn.addEventListener("click", requestGPS);
camBtn.addEventListener("click", checkCameraPerm);

window.addEventListener("resize", () => {
  report.device["Viewport"] = `${window.innerWidth} × ${window.innerHeight}`;
  setBoxes();
});

init();
