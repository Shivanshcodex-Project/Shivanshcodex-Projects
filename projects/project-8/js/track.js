function getOrders(){
  try{ return JSON.parse(localStorage.getItem("orders_v1")) || []; }catch(e){ return []; }
}

function statusFromPct(p){
  if(p < 25) return "Processing";
  if(p < 55) return "Packed & Shipped";
  if(p < 85) return "Out for delivery";
  return "Delivered / Ready";
}

window.lookup = function(){
  const id = document.getElementById("oid").value.trim();
  const orders = getOrders();
  const o = orders.find(x => x.id === id);

  const result = document.getElementById("result");
  if(!o){
    toast("Order not found");
    result.style.display="none";
    return;
  }

  result.style.display="block";
  document.getElementById("rTitle").textContent = `Order: ${o.id}`;
  document.getElementById("rSub").textContent = `${o.city}${o.landmark ? ", "+o.landmark : ""}`;

  const days = o.etaDays || 8;
  const elapsedDays = (Date.now() - o.createdAt) / (1000*60*60*24);
  const pct = Math.max(0, Math.min(100, (elapsedDays / days) * 100));
  document.getElementById("fill").style.width = pct.toFixed(0) + "%";

  const st = statusFromPct(pct);
  document.getElementById("rEta").textContent = `${st} • Delivery in ${days} days`;

  document.getElementById("rDetails").innerHTML = `
    <div class="panel" style="margin:0;">
      <b>Delivery Address</b>
      <div class="muted">${o.name} • ${o.phone}</div>
      <div>${o.addr}</div>
      <div>${o.city}${o.landmark ? ", "+o.landmark : ""}</div>
    </div>
    <div class="panel" style="margin:0;">
      <b>Items</b>
      <div class="muted">Total: ₹${o.total}</div>
      <div style="margin-top:6px;display:grid;gap:6px;">
        ${o.items.map(it=>`<div>• ${it.name} (x${it.qty})</div>`).join("")}
      </div>
    </div>
  `;
};

const last = localStorage.getItem("lastOrderId");
if(last){
  document.getElementById("oid").value = last;
  localStorage.removeItem("lastOrderId");
  lookup();
}
