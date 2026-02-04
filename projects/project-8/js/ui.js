window.toast = function(msg="Done"){
  let t = document.querySelector(".toast");
  if(!t){
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = "✅ " + msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.classList.remove("show"), 1300);
};

function getCartSafe(){
  try { return JSON.parse(localStorage.getItem("cart")) || []; }
  catch(e){ return []; }
}
function money(n){ return "₹" + Number(n||0); }

function buildSheetOnce(){
  if(document.getElementById("miniCartOverlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "sheetOverlay";
  overlay.id = "miniCartOverlay";
  overlay.addEventListener("click", closeMiniCart);

  const sheet = document.createElement("div");
  sheet.className = "sheet";
  sheet.id = "miniCartSheet";

  sheet.innerHTML = `
    <div class="sheetHeader">
      <div class="sheetTitle">🛒 Your Cart</div>
      <button class="sheetClose" onclick="closeMiniCart()">✕</button>
    </div>
    <div class="sheetBody" id="miniCartList"></div>
    <div class="sheetFooter">
      <button class="sheetOpenBtn" onclick="window.location.href='cart.html'">Open Cart</button>
      <button class="sheetSoftBtn" onclick="closeMiniCart()">Continue Shopping</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
}

function renderMiniCart(){
  buildSheetOnce();
  const list = document.getElementById("miniCartList");
  const cart = getCartSafe();

  if(cart.length === 0){
    list.innerHTML = `
      <div class="sheetItem">
        <div style="flex:1">
          <b>Cart is empty</b>
          <div class="muted">Shop se product add karo.</div>
        </div>
      </div>
    `;
    return;
  }

  const show = cart.slice(-4).reverse();
  const total = cart.reduce((s,p)=> s + Number(p.price||0), 0);

  list.innerHTML = show.map(p => `
    <div class="sheetItem">
      <img src="images/${p.folder}/1.jpg" onerror="this.style.display='none'">
      <div style="flex:1">
        <b>${p.name}</b>
        <div class="muted">${money(p.price)}</div>
      </div>
    </div>
  `).join("") + `
    <div class="sheetItem">
      <div style="flex:1">
        <b>Total</b>
        <div class="muted">${money(total)} • Items: ${cart.length}</div>
      </div>
    </div>
  `;
}

window.openMiniCart = function(){
  renderMiniCart();
  document.body.classList.add("sheetOpen");
};
window.closeMiniCart = function(){
  document.body.classList.remove("sheetOpen");
};
