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

const mapFrame = document.getElementById("mapFrame");
const mapHint = document.getElementById("mapHint");
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

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function kvHTML(obj){
  return Object.entries(obj).map(([k,v]) => `
    <div class="k">${escapeHtml(k)}</div>
    <div class="v">${escapeHtml(String(v))}</div>
  `).join("");
}

function setMap(lat, lon, label = "Location"){
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return;

  // OpenStreetMap embed
  const delta = 0.02;
  const left = lo - delta, right = lo + delta, top = la + delta, bottom = la - delta;

  const src =
    `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(left)},${encodeURIComponent(bottom)},${encodeURIComponent(right)},${encodeURIComponent(top)}&layer=mapnik&marker=${encodeURIComponent(la)},${encodeURIComponent(lo)}`;

  mapFrame.src = src;
  mapHint.textContent = `${label}: ${la.toFixed(6)}, ${lo.toFixed(6)}`;
}

function setBoxes(){
  basicBox.innerHTML  = kvHTML(report.basic);
  deviceBox.innerHTML = kvHTML(report.device);

  const netExtra = {};
  if (report.ip) netExtra["Public IP"] = report.ip;
  if (report.ipGeo?.city) netExtra["IP Approx City"] = report.ipGeo.city;
  if (report.ipGeo?.region) netExtra["IP Approx Region"] = report.ipGeo.region;
  if (report.ipGeo?.country_name) netExtra["IP Approx Country"] = report.ipGeo.country_name;
  if (report.ipGeo?.org) netExtra["ASN/Org"] = report.ipGeo.org;

  netBox.innerHTML = kvHTML({
    ...report.network,
    ...netExtra,
    "Tip": "IP works without permission. GPS needs permission."
  });

  permBox.innerHTML = kvHTML(report.permissions);

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
  const out = {};
  if (!navigator.permissions?.query){
    out["Permissions API"] = "Not supported (ok)";
    out["Note"] = "GPS button still works via browser popup.";
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
  // ✅ public IP (stable)
  const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
  const data = await res.json();
  report.ip = data?.ip || null;
  setBoxes();
  showToast("Public IP fetched ✅");
}

async function getIPGeo(){
  if (!report.ip){
    showToast("First click: Get Public IP");
    return;
  }
  // ✅ IP Approx Geo (ipapi provides lat/lon too)
  const res = await fetch(`https://ipapi.co/${encodeURIComponent(report.ip)}/json/`, { cache: "no-store" });
  const data = await res.json();
  report.ipGeo = data || null;

  // show approx map if lat/lon exist
  if (data?.latitude && data?.longitude){
    setMap(data.latitude, data.longitude, "IP Approx Location");
  }

  setBoxes();
  showToast("IP approx location fetched ✅");
}

function requestGPS(){
  if (!navigator.geolocation){
    showToast("Geolocation not supported");
    return;
  }

  showToast("Requesting GPS… (allow popup)");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      report.gps = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        acc: Math.round(pos.coords.accuracy)
      };

      // map exact GPS
      setMap(report.gps.lat, report.gps.lon, "GPS Exact Location");

      // ✅ “og ip” style: permission milte hi IP bhi fetch
      try{
        if (!report.ip) await getIP();
      }catch{}

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
  // Camera permission state (depends on browser support)
  if (!navigator.permissions?.query){
    showToast("Permissions API not supported");
    return;
  }
  try{
    const r = await navigator.permissions.query({ name: "camera" });
    showToast(`Camera: ${r.state}`);
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

PUBLIC IP:
${report.ip || "Not fetched"}

IP GEO:
${report.ipGeo ? JSON.stringify(report.ipGeo, null, 2) : "Not fetched"}

GPS:
${report.gps ? JSON.stringify(report.gps, null, 2) : "Not requested"}
`;
  if (!navigator.clipboard?.writeText){
    showToast("Copy not supported");
    return;
  }
  navigator.clipboard.writeText(text)
    .then(()=> showToast("Copied ✅"))
    .catch(()=> showToast("Copy blocked"));
}

async function init(){
  collect();
  await permissionsState();
  setBoxes();
}

refreshBtn.addEventListener("click", init);
copyAllBtn.addEventListener("click", copyReport);

ipBtn.addEventListener("click", async () => {
  try{ await getIP(); }
  catch{ showToast("IP fetch blocked (try again)"); }
});

ipGeoBtn.addEventListener("click", async () => {
  try{ await getIPGeo(); }
  catch{ showToast("IP geo blocked (try again)"); }
});

gpsBtn.addEventListener("click", requestGPS);
camBtn.addEventListener("click", checkCameraPerm);

window.addEventListener("resize", () => {
  report.device["Viewport"] = `${window.innerWidth} × ${window.innerHeight}`;
  setBoxes();
});

init();
