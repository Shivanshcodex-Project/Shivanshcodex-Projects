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
  qty = Math.max(1, Math.min(10, n));
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
  document.getElementById("pName").textContent = p.name;
  document.getElementById("pPrice").textContent = money(p.price);
  document.getElementById("pDesc").textContent =
    `✔ ${p.name} • Premium fabric • Comfortable fit • Best quality`;

  // ===== 7 photo slider =====
  const imgs = [];
  for(let i=1;i<=7;i++) imgs.push(`images/${p.folder}/${i}.jpg`);

  const track = document.getElementById("slideTrack");
  const dotsWrap = document.getElementById("dots");
  const thumbs = document.getElementById("thumbs");

  let current = 0;

  function go(i){
    const count = track.children.length;
    if(count<=0) return;
    current = Math.max(0, Math.min(count-1, i));
    track.style.transform = `translateX(-${current*100}%)`;
    [...dotsWrap.children].forEach((d,di)=> d.classList.toggle("active", di===current));
  }

  imgs.forEach((src, i)=>{
    // slide
    const s = document.createElement("div");
    s.className = "slide";
    const im = document.createElement("img");
    im.src = src;
    im.alt = p.name;
    im.onerror = ()=> s.remove(); // missing image -> remove slide
    s.appendChild(im);
    track.appendChild(s);

    // dot
    const d = document.createElement("div");
    d.className = "dot";
    d.onclick = ()=> go(i);
    dotsWrap.appendChild(d);

    // thumb
    const t = document.createElement("img");
    t.src = src;
    t.alt = p.name;
    t.style.width="72px"; t.style.height="72px"; t.style.objectFit="cover";
    t.style.borderRadius="14px"; t.style.border="1px solid rgba(0,0,0,.10)";
    t.style.cursor="pointer";
    t.onerror = ()=> t.remove();
    t.onclick = ()=> go(i);
    thumbs.appendChild(t);
  });

  // init
  setTimeout(()=>go(0), 0);

  // auto slide
  setInterval(()=>{
    const count = track.children.length;
    if(count<=1) return;
    go((current+1) % count);
  }, 3500);

  // swipe support
  let startX=0;
  track.addEventListener("touchstart",e=> startX=e.touches[0].clientX, {passive:true});
  track.addEventListener("touchend",e=>{
    const diff = e.changedTouches[0].clientX - startX;
    if(diff>40) go(current-1);
    if(diff<-40) go(current+1);
  });

  function addQtyToCart(){
    for(let i=0;i<qty;i++) addToCart(p.id);
  }
  window.addThis = function(){
    addQtyToCart();
    toast(`✅ Added ${qty} item(s)`);
  };
  window.buyNow = function(){
    addQtyToCart();
    window.location.href = "cart.html";
  };

  // related
  const rel = list.filter(x => x.id !== p.id).slice(0, 20);
  rel.sort(()=> Math.random()-0.5);
  const show = rel.slice(0,4);
  const relGrid = document.getElementById("relGrid");
  relGrid.innerHTML = show.map(r=>`
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
  `).join("");

  setQty(1);
}
