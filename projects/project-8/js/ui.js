// ===============================
// UI helpers: Drawer + Toast + MiniCart Sheet
// ===============================

function showToast(msg){
  let t = document.querySelector(".toast");
  if(!t){
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.classList.remove("show"), 1400);
}

function openMiniCart(){
  // ✅ refresh content if cart.js has renderMiniCart()
  if(typeof renderMiniCart === "function") renderMiniCart();

  document.body.classList.add("sheetOpen");
}

function closeMiniCart(){
  document.body.classList.remove("sheetOpen");
}

// optional: close on ESC (desktop)
window.addEventListener("keydown",(e)=>{
  if(e.key === "Escape") closeMiniCart();
});
