let qty = 1;
let currentSlide = 0;

function qs(key){
  return new URLSearchParams(location.search).get(key);
}

function qtyPlus(){
  qty++;
  document.getElementById("qtyNum").textContent = qty;
}
function qtyMinus(){
  qty = Math.max(1, qty-1);
  document.getElementById("qtyNum").textContent = qty;
}

function addThis(){
  const id = qs("id");
  addToCart(id, qty);
}
function buyNow(){
  const id = qs("id");
  addToCart(id, qty);
  location.href = "cart.html";
}

function setSlide(i){
  const track = document.getElementById("slideTrack");
  const dots = Array.from(document.querySelectorAll(".dot"));
  if(!track) return;

  currentSlide = Math.max(0, Math.min(i, dots.length-1));
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d,idx)=>d.classList.toggle("active", idx===currentSlide));
}

function buildSliderImages(folder, count){
  const track = document.getElementById("slideTrack");
  const dotsWrap = document.getElementById("dots");
  const thumbs = document.getElementById("thumbs");
  if(!track || !dotsWrap || !thumbs) return;

  const n = Math.max(1, Number(count||1));

  track.innerHTML = "";
  dotsWrap.innerHTML = "";
  thumbs.innerHTML = "";

  for(let i=1;i<=n;i++){
    track.innerHTML += `
      <div class="slide">
        <img src="images/${folder}/${i}.jpg" alt="photo ${i}">
      </div>
    `;
    dotsWrap.innerHTML += `<div class="dot ${i===1?'active':''}" onclick="setSlide(${i-1})"></div>`;
    thumbs.innerHTML += `<img src="images/${folder}/${i}.jpg" style="width:72px;height:72px;object-fit:cover;border-radius:14px;border:1px solid rgba(0,0,0,.10);cursor:pointer" onclick="setSlide(${i-1})">`;
  }

  // swipe support
  let startX = 0;
  track.addEventListener("touchstart", (e)=>{ startX = e.touches[0].clientX; }, {passive:true});
  track.addEventListener("touchend", (e)=>{
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if(Math.abs(diff) < 30) return;
    if(diff < 0) setSlide(currentSlide + 1);
    else setSlide(currentSlide - 1);
  }, {passive:true});

  setSlide(0);
}

function renderRelated(currId){
  const relGrid = document.getElementById("relGrid");
  if(!relGrid) return;

  const list = (products||[]).filter(p=>p.id!==currId).slice(0, 6);
  relGrid.innerHTML = list.map(p=>`
    <div class="card">
      <a href="product.html?id=${p.id}">
        <img class="thumb" src="images/${p.folder}/1.jpg" alt="${p.name}">
      </a>
      <div class="cardBody">
        <a href="product.html?id=${p.id}" style="display:block">
          <div class="cardTitle">${p.name}</div>
        </a>
        <div class="priceRow">
          <div class="price">₹${p.price}</div>
          <div class="tag">Bestseller</div>
        </div>
        <button class="btn btnPrimary" onclick="addToCart('${p.id}',1)">Add to Cart</button>
      </div>
    </div>
  `).join("");
}

(function init(){
  const id = qs("id");
  const p = (products||[]).find(x=>x.id===id);

  if(!p){
    document.body.innerHTML = `<div class="panel center"><div style="font-weight:1100">Product not found</div><a class="btn btnSoft" href="shop.html">Back to shop</a></div>`;
    return;
  }

  document.getElementById("pName").textContent = p.name;
  document.getElementById("pPrice").textContent = `₹${p.price}`;
  document.getElementById("pDesc").textContent = p.desc || `${p.name} • Premium fabric • Comfortable fit • Best quality`;

  // ✅ IMPORTANT: products.js me images: 7 rakhna (ya jitni tumne dali)
  buildSliderImages(p.folder, p.images || 1);
  renderRelated(p.id);
})();
