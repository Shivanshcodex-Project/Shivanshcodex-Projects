function trackOrder(){
  const id = document.getElementById("oid").value.trim();
  const result = document.getElementById("result");

  const orders = JSON.parse(localStorage.getItem("orders")) || {};
  const order = orders[id];

  if(!order){
    result.innerHTML = `
      <div class="card" style="max-width:520px;margin:12px auto;">
        <h3 style="text-align:center;">❌ Order not found</h3>
        <p class="small">Order ID check karke dobara daalo.</p>
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
    <div class="card" style="max-width:520px;margin:12px auto;">
      <h3 style="text-align:center;">✅ Order Found</h3>

      <p style="text-align:center;font-weight:900;margin:6px 0;">
        Order ID: <span style="color:#1e90ff">${order.orderId}</span>
      </p>

      <div style="padding:10px;display:grid;gap:8px;">
        <div><b>Name:</b> ${order.name}</div>
        <div><b>Phone:</b> ${order.phone}</div>
        <div><b>Address:</b> ${order.address}</div>
        <div><b>City:</b> ${order.city}</div>
        <div><b>Landmark:</b> ${order.landmark}</div>
        <div><b>Total:</b> ₹${order.total}</div>
      </div>

      <p style="text-align:center;font-weight:900;margin-top:6px;">
        Status: ${status}
      </p>

      <div class="bar">
        <div class="fill" style="width:${percent}%;"></div>
      </div>

      <p class="small">Delivery progress: ${percent}% (ETA: ${totalDays} days)</p>
    </div>
  `;
}
