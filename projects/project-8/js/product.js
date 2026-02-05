function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const id = getParam("id");
const list = window.products || [];
const p = list.find(x => x.id === id);

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
  document.getElementById("pPrice").textContent = "₹" + p.price;

  // ✅ Multiple photos support:
  // Put photos like: images/product1/1.jpg, 2.jpg, 3.jpg, 4.jpg
  const imgs = [1,2,3,4].map(n => `images/${p.folder}/${n}.jpg`);

  const main = document.getElementById("mainImg");
  main.src = imgs[0];

  const thumbs = document.getElementById("thumbs");
  imgs.forEach((src, i)=>{
    const t = document.createElement("img");
    t.src = src;
    t.style.width = "72px";
    t.style.height = "72px";
    t.style.objectFit = "cover";
    t.style.borderRadius = "14px";
    t.style.border = "1px solid rgba(0,0,0,.10)";
    t.style.cursor = "pointer";
    t.onerror = () => { t.style.display = "none"; }; // if photo not present, hide
    t.onclick = () => { main.src = src; };
    thumbs.appendChild(t);
  });

  // Description (optional)
  const desc = document.getElementById("pDesc");
  desc.textContent = `✔ ${p.name} • Premium fabric • Comfortable fit • Best quality`;

  window.addThis = function(){
    addToCart(p.id);
  };

  window.buyNow = function(){
    addToCart(p.id);
    window.location.href = "cart.html";
  };
}
