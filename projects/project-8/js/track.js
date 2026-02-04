function trackOrder(){
  const id = document.getElementById("oid").value.trim();
  const result = document.getElementById("result");

  const orders = JSON.parse(localStorage.getItem("orders")) || {};
  const order = orders[id];

  if(!order){
    result.innerHTML = `
      <div class="panel">
        <h2 class="center">❌ Order not found</h2>
        <p class="muted center">Order ID sahi se check karo.</p>
      </div>
    `;
    return;
  }

  const totalDays = order.etaDays || 8;
  const totalMs = totalDays * 24 * 60 * 60 * 1000;

  const now = Date.now();
  const elapsed = now - (order.createdAt || now);
  const progress = Math.max(0, Math.min(1, elapsed / totalMs));
  const percent = Math.round(progress * 100);

  let status = "Order Confirmed";
  if(percent >= 25) status = "Packed";
  if(percent >= 50) status = "Shipped";
  if(percent >= 75) status = "Out for Delivery";
  if(percent >= 100) status = "Delivered ✅";

  result.innerHTML = `
    <div class="panel">
      <h2 class="center">✅ Order Found</h2>

      <p class="center" style="font-weight:1100;margin-top:6px;">
        Order ID: <span style="color:#1e90ff;">${order.orderId}</span>
      </p>

      <div class="card" style="padding:12px;margin-top:10px;">
        <div style="display:grid;gap:8px;font-weight:800;">
          <div><span class="muted">Name:</span> ${order.name}</div>
          <div><span class="muted">Phone:</span> ${order.phone}</div>
          <div><span class="muted">Address:</span> ${order.address}</div>
          <div><span class="muted">City:</span> ${order.city}</div>
          <div><span class="muted">Landmark:</span> ${order.landmark}</div>
          <div><span class="muted">Total:</span> ₹${order.total}</div>
        </div>
      </div>

      <div class="card" style="padding:12px;margin-top:10px;">
        <div class="center" style="font-weight:1100;">Status: ${status}</div>

        <div class="bar">
          <div class="fill" style="width:${percent}%;"></div>
        </div>

        <div class="small">Delivery progress: ${percent}% • ETA: ${totalDays} days</div>
      </div>
    </div>
  `;
}
