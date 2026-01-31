import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

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

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const msg = document.getElementById("msg");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");

function setMsg(text, type = "") {
  msg.className = "msg " + (type || "");
  msg.textContent = text || "";
}

function normalizeUsername(u) {
  return (u || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

function usernameToEmail(username) {
  // user ko email dikhana nahi, but firebase ko email chahiye
  return `${username}@shivansh.local`;
}

// Toggle tabs
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  setMsg("");
  loginUsername.focus();
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  setMsg("");
  regUsername.focus();
});

// If logged in -> dashboard
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "./dashboard.html";
});

// Login submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("");

  const u = normalizeUsername(loginUsername.value);
  const p = loginPassword.value;

  if (u.length < 3) return setMsg("Username min 3 characters.", "err");
  if (p.length < 6) return setMsg("Password min 6 characters.", "err");

  const email = usernameToEmail(u);

  try {
    setMsg("Logging in…");
    await signInWithEmailAndPassword(auth, email, p);
    setMsg("Login success ✅", "ok");
    window.location.href = "./dashboard.html";
  } catch (err) {
    setMsg(err?.message || "Login failed.", "err");
  }
});

// Register submit
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("");

  const u = normalizeUsername(regUsername.value);
  const p = regPassword.value;

  if (u.length < 3) return setMsg("Username min 3 characters.", "err");
  if (p.length < 6) return setMsg("Password min 6 characters.", "err");

  const email = usernameToEmail(u);

  try {
    setMsg("Creating account…");
    const cred = await createUserWithEmailAndPassword(auth, email, p);
    await updateProfile(cred.user, { displayName: u });

    setMsg("Account created ✅", "ok");
    window.location.href = "./dashboard.html";
  } catch (err) {
    setMsg(err?.message || "Register failed.", "err");
  }
});
