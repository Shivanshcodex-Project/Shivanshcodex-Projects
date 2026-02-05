function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}
function money(n){ return "₹" + Number(n||0); }

const id = getParam("id");
const list = window.products || [];
const p = list.find(x => x.id === id);

let qty = 1;

function setQty(n){
  qty = Math.max(1, Math.min(10, n)); // 1–10
  const el = document.getElementById("qtyNum");
  if(el) el.textContent = String(qty);
}
window.qtyPlus = () => setQty(qty + 1);
window.qtyMinus = () => setQty(qty - 1);

if(!p){
  document.body.innerHTML = `
    <div class="panel" style="margin-top:70px;">
      <h2 class="center">❌ Product not found</h2>
      <a class="btn btnPrimary" href="shop.html">Back to Shop</a>
    </div>
  `;
} else {
  // Title/price
  document.getElementById("pName").textContent = p.name;
  document.getElementById("pPrice").textContent = money(p.price);

  // Photos: images/productX/1.jpg ... 4.jpg
  const imgs = [1,2,3,4].map(n => `images/${p.folder}/${n}.jpg`);
  const main = document.getElementById("mainImg");
  main.src = imgs[0];

  const thumbs = document.getElementById("thumbs");
  imgs.forEach((src)=>{
    const t = document.createElement("img");
    t.src = src;
    t.alt = p.name;
    t.onerror = () => { t.style.display = "none"; };
    t.onclick = () => { main.src = src; };
    thumbs.appendChild(t);
  });

  // Description
  document.getElementById("pDesc").textContent =
    `✔ ${p.name} • Premium fabric • Comfortable fit • Best quality`;

  // ✅ Add to cart with quantity (existing cart system = per unit push)
  function addQtyToCart(){
    for(let i=0;i<qty;i++) addToCart(p.id);
  }

  window.addThis = function(){
    addQtyToCart();
    if(window.toast) toast(`Added ${qty} item(s)`);
  };

  window.buyNow = function(){
    addQtyToCart();
    window.location.href = "cart.html";
  };

  // ✅ Related products (4 items, excluding current)
  const rel = list.filter(x => x.id !== p.id).slice(0, 12);
  // shuffle
  rel.sort(()=> Math.random() - 0.5);
  const show = rel.slice(0,4);

  const relGrid = document.getElementById("relGrid");
  relGrid.innerHTML = "";
  show.forEach(r=>{
    relGrid.innerHTML += `
      <div class="card">
        <a href="product.html?id=${r.id}">
          <img class="thumb" src="images/${r.folder}/1.jpg" alt="${r.name}">
        </a>
        <div class="cardBody">
          <a href="product.html?id=${r.id}" style="display:block;text-decoration:none;color:inherit">
            <div class="cardTitle">${r.name}</div>
          </a>
          <div class="priceRow">
            <div class="price">${money(r.price)}</div>
            <div class="tag">Bestseller</div>
          </div>
          <button class="btn btnPrimary" onclick="addToCart('${r.id}')">Add to Cart</button>
        </div>
      </div>
    `;
  });

  setQty(1);
}
