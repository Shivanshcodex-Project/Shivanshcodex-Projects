const UPI_ID = "priyanshuclothing@fam";
const SUPPORT_PHONE = "+58426-8849301";

document.getElementById("upiId").textContent = UPI_ID;

function makeOrderId(){
  return "OD" + Math.floor(100000000 + Math.random()*900000000);
}

function upiLink(amount, note){
  const pa = encodeURIComponent(UPI_ID);
  const pn = encodeURIComponent("Priyanshu Clothing");
  const am = encodeURIComponent(String(amount));
  const tn = encodeURIComponent(note);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

function setPaymentUI(){
  const total = cartTotal();
  if(total<=0){
    toast("Cart empty"); location.href="cart.html"; return;
  }
  const note = "Order Payment";
  const link = upiLink(total, note);

  // QR Image (online generator)
  const qr = document.getElementById("qrImg");
  qr.src = "https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=" + encodeURIComponent(link);

  const payBtn = document.getElementById("payBtn");
  payBtn.textContent = "Pay " + money(total);
  payBtn.onclick = ()=> window.location.href = link;

  const waBtn = document.getElementById("waBtn");
  const text = `Hi! Maine ${total} ka payment kar diya hai. Screenshot bhej raha/rahi hoon. Please approve my order.`;
  waBtn.onclick = ()=>{
    const wa = `https://wa.me/${SUPPORT_PHONE.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(text)}`;
    window.open(wa, "_blank");
  };
}

function getOrders(){
  try{ return JSON.parse(localStorage.getItem("orders_v1")) || []; }catch(e){ return []; }
}
function setOrders(arr){
  localStorage.setItem("orders_v1", JSON.stringify(arr));
}

window.placeOrder = function(){
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const addr = document.getElementById("addr").value.trim();
  const city = document.getElementById("city").value.trim();
  const landmark = document.getElementById("landmark").value.trim();

  if(!name || !phone || !addr || !city){
    toast("Please fill details");
    return;
  }

  const items = cartItems();
  const total = cartTotal();
  const id = makeOrderId();

  const order = {
    id,
    name, phone, addr, city, landmark,
    items,
    total,
    createdAt: Date.now(),
    etaDays: 8
  };

  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);

  clearCart();
  toast("✅ Order placed: " + id);

  // go track page + auto fill
  localStorage.setItem("lastOrderId", id);
  window.location.href = "track.html";
}

setPaymentUI();
