function getCart(){
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(c){
  localStorage.setItem("cart", JSON.stringify(c));
}

function addToCart(id){
  const cart = getCart();
  const p = (window.products || window.PRODUCTS || []).find(x => x.id === id);
  if(!p){
    if(window.toast) toast("Product not found");
    return;
  }
  cart.push(p);
  saveCart(cart);
  if(window.toast) toast("Added to cart");
}

function removeCartItem(index){
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  if(window.toast) toast("Removed");
  location.reload();
}
