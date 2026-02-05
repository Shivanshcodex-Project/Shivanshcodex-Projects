// ===============================
// Priyanshu Clothing - cart.js
// Works with: window.products (products.js)
// Storage key: pc_cart_v1
// ===============================

const CART_KEY = "pc_cart_v1";

// ---------- Storage ----------
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---------- Product Lookup ----------
function getProductsList() {
  // ✅ supports both window.products and plain products
  if (Array.isArray(window.products)) return window.products;
  if (typeof products !== "undefined" && Array.isArray(products)) return products;
  return [];
}

function findProductById(id) {
  const list = getProductsList();
  return (list || []).find((x) => x.id === id);
}

// ---------- Total ----------
function cartTotal() {
  const cart = getCart();
  let total = 0;
  cart.forEach((i) => {
    total += (Number(i.price) || 0) * (Number(i.qty) || 1);
  });
  return total;
}

// ---------- Add / Remove / Update ----------
function addToCart(id, qty = 1) {
  const p = findProductById(id);

  if (!p) {
    if (typeof showToast === "function") showToast("Product not found");
    else alert("Product not found");
    return;
  }

  const q = Math.max(1, Number(qty || 1));
  const cart = getCart();

  const existing = cart.find((i) => i.id === id);
  if (existing) {
    existing.qty = (Number(existing.qty) || 1) + q;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      folder: p.folder,
      qty: q,
    });
  }

  setCart(cart);

  if (typeof showToast === "function") showToast("✅ Added to cart");
  // ✅ user ko dikhe ki add hua
  if (typeof openMiniCart === "function") openMiniCart();
  else renderMiniCart();
}

function removeFromCart(id) {
  const cart = getCart().filter((i) => i.id !== id);
  setCart(cart);

  if (typeof showToast === "function") showToast("Removed");
  renderMiniCart();
  renderCartPage();
}

function updateQty(id, newQty) {
  const qty = Math.max(1, Number(newQty || 1));
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.qty = qty;
  setCart(cart);

  renderMiniCart();
  renderCartPage();
}

function clearCart() {
  setCart([]);
  renderMiniCart();
  renderCartPage();
}

// ---------- Mini Cart (Bottom Sheet) ----------
function renderMiniCart() {
  const body = document.getElementById("miniCartBody");
  const totalEl = document.getElementById("miniCartTotal");
  if (!body || !totalEl) return; // page pe sheet nahi hai

  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="muted" style="text-align:center;padding:10px;">
        Cart is empty
      </div>
    `;
    totalEl.textContent = "Total: ₹0";
    return;
  }

  body.innerHTML = cart
    .map((item) => {
      const qty = Number(item.qty) || 1;
      const price = Number(item.price) || 0;
      return `
        <div class="sheetItem">
          <img src="images/${item.folder}/1.jpg" alt="">
          <div style="flex:1;">
            <b>${item.name}</b>
            <div class="muted">₹${price} • Qty: ${qty}</div>
          </div>
          <button class="iconBtn" style="width:40px;height:40px" onclick="removeFromCart('${item.id}')">✕</button>
        </div>
      `;
    })
    .join("");

  totalEl.textContent = `Total: ₹${cartTotal()}`;
}

// ---------- Cart Page ----------
function renderCartPage() {
  const wrap = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!wrap || !totalEl) return; // cart.html pe hi chalega

  const cart = getCart();

  if (cart.length === 0) {
    wrap.innerHTML = `
      <div class="panel center">
        <div style="font-weight:1100;font-size:18px;">🛒 Your Cart</div>
        <div class="muted" style="margin-top:6px;">Cart is empty<br>Shop se product add karo.</div>
        <div class="total" style="margin-top:12px;">Total Amount: ₹0</div>
        <a class="btn btnSoft" href="shop.html">⬅ Back to Shop</a>
      </div>
    `;
    totalEl.textContent = "0";
    return;
  }

  wrap.innerHTML = cart
    .map((item) => {
      const qty = Number(item.qty) || 1;
      const price = Number(item.price) || 0;

      return `
        <div class="panel">
          <div style="display:flex;gap:12px;align-items:center;">
            <img src="images/${item.folder}/1.jpg"
              style="width:74px;height:74px;object-fit:cover;border-radius:16px;border:1px solid rgba(0,0,0,.08)">
            <div style="flex:1;">
              <div style="font-weight:1100">${item.name}</div>
              <div class="muted" style="margin-top:4px;">₹${price}</div>

              <div style="display:flex;gap:10px;align-items:center;margin-top:10px;">
                <button class="qtyBtn" onclick="updateQty('${item.id}', ${qty - 1})">−</button>
                <div class="qtyNum">${qty}</div>
                <button class="qtyBtn" onclick="updateQty('${item.id}', ${qty + 1})">+</button>
              </div>
            </div>
          </div>

          <button class="btn btnDanger" onclick="removeFromCart('${item.id}')">✖ Remove</button>
        </div>
      `;
    })
    .join("");

  totalEl.textContent = String(cartTotal());
}

// ---------- Init ----------
window.addEventListener("load", () => {
  // Mini-cart + cart page both auto update
  renderMiniCart();
  renderCartPage();
});
