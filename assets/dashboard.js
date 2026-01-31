import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzW-TNlRRvWiRZHvrWgu1ZdSXUtOXn2nI",
  authDomain: "shivanshcodex-project.firebaseapp.com",
  projectId: "shivanshcodex-project",
  storageBucket: "shivanshcodex-project.firebasestorage.app",
  messagingSenderId: "220303544352",
  appId: "1:220303544352:web:29108432b9dfd6207fac45"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const userLine = document.getElementById("userLine");
const logoutBtn = document.getElementById("logoutBtn");
const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const search = document.getElementById("search");
const count = document.getElementById("count");

let allProjects = [];

function escapeHtml(str){
  return String(str || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function render(list){
  grid.innerHTML = "";
  count.textContent = String(list.length);

  if (!list.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;

    card.innerHTML = `
      <h3>${escapeHtml(p.title || "Untitled")}</h3>
      <p>${escapeHtml(p.desc || "")}</p>
      <span class="tag">${escapeHtml(p.tag || "project")}</span>
    `;

    const go = () => window.location.href = p.url;
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") go();
    });

    grid.appendChild(card);
  });
}

async function loadProjects(){
  const res = await fetch("./projects.json", { cache: "no-store" });
  const data = await res.json();
  allProjects = Array.isArray(data) ? data : [];
  render(allProjects);
}

// Auth guard
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  const name = user.displayName || (user.email ? user.email.split("@")[0] : "user");
  userLine.textContent = `Logged in as @${name}`;

  try {
    await loadProjects();
  } catch (e) {
    render([]);
    empty.classList.remove("hidden");
    empty.innerHTML = `<h3>projects.json load nahi hua</h3><p>Check file name/path + deploy.</p>`;
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "./index.html";
});

search.addEventListener("input", () => {
  const q = (search.value || "").trim().toLowerCase();
  if (!q) return render(allProjects);

  const filtered = allProjects.filter(p => {
    const t = (p.title || "").toLowerCase();
    const d = (p.desc || "").toLowerCase();
    const tag = (p.tag || "").toLowerCase();
    return t.includes(q) || d.includes(q) || tag.includes(q);
  });

  render(filtered);
});
