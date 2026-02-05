const CART_KEY = "cart_v1";

function getCart(){
  try{
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  }catch(e){ return {}; }
}
function setCart(obj){
  localStorage.setItem(CART_KEY, JSON.stringify(obj));
}
function money(n){ return "₹" + Number(n||0); }

function findProduct(id){
  return (window.products || []).find(p=>p.id===id);
}

function addToCart(id){
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  setCart(cart);
  if(window.toast) toast("✅ Added to cart");
  if(window.renderMiniCart) renderMiniCart();
}

function decFromCart(id){
  const cart = getCart();
  if(!cart[id]) return;
  cart[id]--;
  if(cart[id] <= 0) delete cart[id];
  setCart(cart);
  if(window.renderMiniCart) renderMiniCart();
}

function removeItem(id){
  const cart = getCart();
  delete cart[id];
  setCart(cart);
  if(window.renderMiniCart) renderMiniCart();
}

function clearCart(){
  setCart({});
  if(window.renderMiniCart) renderMiniCart();
}

function cartItems(){
  const cart = getCart();
  const items = [];
  Object.keys(cart).forEach(id=>{
    const p = findProduct(id);
    if(p) items.push({ ...p, qty: cart[id] });
  });
  return items;
}

function cartTotal(){
  return cartItems().reduce((sum,it)=> sum + it.price*it.qty, 0);
}

// expose
window.addToCart = addToCart;
window.decFromCart = decFromCart;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.cartItems = cartItems;
window.cartTotal = cartTotal;
window.money = money;
