function getCart(){
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(c){
  localStorage.setItem("cart", JSON.stringify(c));
}

function addToCart(id){
  const cart = getCart();
  const p = products.find(x => x.id === id);
  if(!p) return alert("Product not found!");
  cart.push(p);
  saveCart(cart);
  alert("✅ Added to cart");
}

function removeCartItem(index){
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  location.reload();
}
