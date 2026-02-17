// ============================================
// ShopEase E-Commerce - Orders Module
// ============================================

const OrdersModule = {
  // Order status definitions
  statusDefinitions: {
    'confirmed': { label: 'Order Confirmed', color: '#2874f0', icon: 'check' },
    'packed': { label: 'Packed', color: '#ff9f00', icon: 'package' },
    'shipped': { label: 'Shipped', color: '#673ab7', icon: 'truck' },
    'out-for-delivery': { label: 'Out for Delivery', color: '#03a9f4', icon: 'map-pin' },
    'delivered': { label: 'Delivered', color: '#388e3c', icon: 'home' },
    'cancelled': { label: 'Cancelled', color: '#d32f2f', icon: 'x' },
    'returned': { label: 'Returned', color: '#757575', icon: 'rotate-ccw' },
    'refunded': { label: 'Refunded', color: '#388e3c', icon: 'refresh-cw' }
  },
  
  // Get all orders
  getOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
  },
  
  // Get order by ID
  getOrder(orderId) {
    const orders = this.getOrders();
    return orders.find(o => o.id === orderId);
  },
  
  // Get orders by status
  getOrdersByStatus(status) {
    const orders = this.getOrders();
    return orders.filter(o => o.status === status);
  },
  
  // Get recent orders
  getRecentOrders(limit = 5) {
    const orders = this.getOrders();
    return orders.slice(0, limit);
  },
  
  // Cancel order
  cancelOrder(orderId, reason = '') {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return { success: false, error: 'Order not found' };
    }
    
    const order = orders[orderIndex];
    
    // Can only cancel if not yet delivered
    if (['delivered', 'cancelled', 'returned', 'refunded'].includes(order.status)) {
      return { success: false, error: 'Order cannot be cancelled' };
    }
    
    order.status = 'cancelled';
    order.cancelReason = reason;
    order.cancelledAt = new Date().toISOString();
    order.timeline.push({
      status: 'Order Cancelled',
      date: new Date().toISOString(),
      description: reason || 'Order has been cancelled'
    });
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Process refund if payment was made
    if (order.payment) {
      this.initiateRefund(orderId, 'Order cancelled by customer');
    }
    
    return { success: true, message: 'Order cancelled successfully' };
  },
  
  // Request return
  requestReturn(orderId, reason, items = []) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    if (order.status !== 'delivered') {
      return { success: false, error: 'Order must be delivered before return' };
    }
    
    // Check return window (7 days)
    const deliveredDate = new Date(order.timeline.find(t => t.status === 'Delivered')?.date || order.date);
    const daysSinceDelivery = (new Date() - deliveredDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceDelivery > 7) {
      return { success: false, error: 'Return window has expired (7 days)' };
    }
    
    // Create return request
    const returnRequest = {
      orderId: orderId,
      date: new Date().toISOString(),
      reason: reason,
      items: items.length > 0 ? items : order.items.map(i => i.id),
      status: 'pending'
    };
    
    const returns = JSON.parse(localStorage.getItem('returnRequests')) || [];
    returns.push(returnRequest);
    localStorage.setItem('returnRequests', JSON.stringify(returns));
    
    order.returnRequested = true;
    order.returnReason = reason;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return { success: true, message: 'Return request submitted' };
  },
  
  // Initiate refund
  initiateRefund(orderId, reason) {
    const refundRequest = {
      orderId: orderId,
      date: new Date().toISOString(),
      reason: reason,
      status: 'processing'
    };
    
    const refunds = JSON.parse(localStorage.getItem('refundRequests')) || [];
    refunds.push(refundRequest);
    localStorage.setItem('refundRequests', JSON.stringify(refunds));
    
    return { success: true };
  },
  
  // Get order statistics
  getOrderStats() {
    const orders = this.getOrders();
    
    return {
      total: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
      byStatus: {
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        packed: orders.filter(o => o.status === 'packed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        outForDelivery: orders.filter(o => o.status === 'out-for-delivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        returned: orders.filter(o => o.status === 'returned').length
      },
      recent: orders.slice(0, 5)
    };
  },
  
  // Download invoice
  downloadInvoice(orderId) {
    const order = this.getOrder(orderId);
    if (!order) {
      showToast('Order not found', 'error');
      return;
    }
    
    // Generate invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ShopEase</h1>
          <p>Tax Invoice</p>
        </div>
        <div class="invoice-details">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
          <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Total: ${formatPrice(order.total)}</p>
        </div>
      </body>
      </html>
    `;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  },
  
  // Reorder items
  reorder(orderId) {
    const order = this.getOrder(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    // Add items to cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    order.items.forEach(item => {
      const existingItem = cart.find(c => c.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        cart.push({ id: item.id, quantity: item.quantity });
      }
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    return { success: true, message: 'Items added to cart' };
  },
  
  // Rate and review order
  submitReview(orderId, rating, review) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    if (order.status !== 'delivered') {
      return { success: false, error: 'Can only review delivered orders' };
    }
    
    order.review = {
      rating: rating,
      review: review,
      date: new Date().toISOString()
    };
    
    localStorage.setItem('orders', JSON.stringify(orders));
    return { success: true, message: 'Review submitted successfully' };
  }
};

// Make OrdersModule available globally
window.OrdersModule = OrdersModule;
