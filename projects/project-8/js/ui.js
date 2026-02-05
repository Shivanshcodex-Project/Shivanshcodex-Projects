function toast(msg){
  let el = document.querySelector(".toast");
  if(!el){
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(()=> el.classList.remove("show"), 1400);
}
window.toast = toast;

// Mini cart bottom sheet (auto inject once)
function ensureSheet(){
  if(document.getElementById("miniSheet")) return;

  const overlay = document.createElement("div");
  overlay.className = "sheetOverlay";
  overlay.onclick = closeMiniCart;

  const sheet = document.createElement("div");
  sheet.className = "sheet";
  sheet.id = "miniSheet";

  sheet.innerHTML = `
    <div class="sheetHeader">
      <div class="sheetTitle">🛍️ Cart Preview</div>
      <button class="sheetClose" onclick="closeMiniCart()">✕</button>
    </div>
    <div class="sheetBody" id="miniBody"></div>
    <div class="sheetFooter">
      <button class="sheetOpenBtn" onclick="location.href='cart.html'">Open Cart</button>
      <button class="sheetSoftBtn" onclick="closeMiniCart()">Continue Shopping</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(sheet);
}

function openMiniCart(){
  ensureSheet();
  renderMiniCart();
  document.body.classList.add("sheetOpen");
}
function closeMiniCart(){
  document.body.classList.remove("sheetOpen");
}

function renderMiniCart(){
  ensureSheet();
  const body = document.getElementById("miniBody");
  const items = (window.cartItems ? cartItems() : []);
  if(items.length===0){
    body.innerHTML = `<div class="panel center"><b>Cart is empty</b><div class="muted">Shop se product add karo.</div></div>`;
    return;
  }

  body.innerHTML = items.map(it=>`
    <div class="sheetItem">
      <img src="images/${it.folder}/1.jpg" alt="${it.name}">
      <div style="flex:1">
        <b>${it.name}</b>
        <div class="muted">${money(it.price)} • Qty: ${it.qty}</div>
      </div>
      <button class="iconBtn" onclick="removeItem('${it.id}')">🗑️</button>
    </div>
  `).join("") + `
    <div class="panel center">
      <div class="total">Total: ${money(cartTotal())}</div>
      <button class="btn btnPrimary" onclick="location.href='payment.html'">Proceed to Payment</button>
    </div>
  `;
}

window.openMiniCart = openMiniCart;
window.closeMiniCart = closeMiniCart;
window.renderMiniCart = renderMiniCart;
