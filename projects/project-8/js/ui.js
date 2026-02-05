(function(){
  // ✅ Toast element auto add
  if(!document.querySelector(".toast")){
    const t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
})();

function showToast(msg){
  const t = document.querySelector(".toast");
  if(!t) return alert(msg);
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 1400);
}

function openMiniCart(){
  document.body.classList.add("sheetOpen");
  if(typeof renderMiniCart === "function") renderMiniCart();
}
function closeMiniCart(){
  document.body.classList.remove("sheetOpen");
}
