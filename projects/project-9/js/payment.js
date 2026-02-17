// ============================================
// ShopEase E-Commerce - Payment Module
// ============================================

const PaymentModule = {
  // Payment methods
  paymentMethods: {
    upi: { name: 'UPI', icon: 'upi' },
    card: { name: 'Credit/Debit Card', icon: 'card' },
    netbanking: { name: 'Net Banking', icon: 'bank' },
    wallet: { name: 'Wallets', icon: 'wallet' },
    cod: { name: 'Cash on Delivery', icon: 'cash' }
  },
  
  // UPI IDs for demo
  demoUpiIds: [
    'kundan2829@alx',
    'shopease@upi',
    'pay@shopease'
  ],
  
  // Generate UPI payment URL
  generateUpiUrl(amount, transactionId, note = 'ShopEase Order') {
    const upiId = this.demoUpiIds[0];
    const params = new URLSearchParams({
      pa: upiId,
      pn: 'ShopEase',
      am: amount.toString(),
      tn: note,
      tr: transactionId
    });
    
    return `upi://pay?${params.toString()}`;
  },
  
  // Generate QR code data (for demo, returns a data URL)
  generateQRData(amount, transactionId) {
    // In a real app, this would generate an actual QR code
    // For demo, we return a placeholder
    return {
      upiUrl: this.generateUpiUrl(amount, transactionId),
      upiId: this.demoUpiIds[0],
      amount: amount,
      transactionId: transactionId
    };
  },
  
  // Validate card details
  validateCard(cardNumber, expiry, cvv, name) {
    const errors = [];
    
    // Card number validation (Luhn algorithm)
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      errors.push('Please enter a valid 16-digit card number');
    }
    
    // Expiry validation
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      errors.push('Please enter expiry in MM/YY format');
    } else {
      const [month, year] = expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiryDate < new Date()) {
        errors.push('Card has expired');
      }
    }
    
    // CVV validation
    if (!/^\d{3,4}$/.test(cvv)) {
      errors.push('Please enter a valid CVV');
    }
    
    // Name validation
    if (!name || name.trim().length < 3) {
      errors.push('Please enter the cardholder name');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  // Process payment (simulated)
  async processPayment(paymentData) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        const success = Math.random() > 0.05;
        
        if (success) {
          resolve({
            success: true,
            transactionId: 'TXN' + Date.now(),
            message: 'Payment successful'
          });
        } else {
          resolve({
            success: false,
            error: 'Payment failed. Please try again.',
            code: 'PAYMENT_FAILED'
          });
        }
      }, 2000);
    });
  },
  
  // Create order after successful payment
  createOrder(paymentResult) {
    const checkoutData = CheckoutModule.getCheckoutData();
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (!checkoutData || cart.length === 0) {
      return { success: false, error: 'No checkout data found' };
    }
    
    const orderId = 'ORD' + Date.now();
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      items: checkoutData.items.map(item => ({
        id: item.id,
        title: item.title,
        image: item.images[0],
        price: item.price,
        quantity: item.quantity
      })),
      total: checkoutData.pricing.total,
      status: 'confirmed',
      statusIndex: 0,
      address: checkoutData.address,
      payment: {
        method: 'upi',
        transactionId: paymentResult.transactionId,
        amount: checkoutData.pricing.total
      },
      trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      timeline: [
        { 
          status: 'Order Confirmed', 
          date: new Date().toISOString(), 
          description: 'Your order has been confirmed' 
        }
      ]
    };
    
    // Save order
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart and checkout data
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('currentAddress');
    localStorage.removeItem('appliedCoupon');
    
    return { success: true, orderId: orderId };
  },
  
  // Get payment history
  getPaymentHistory() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders.map(order => ({
      orderId: order.id,
      date: order.date,
      amount: order.total,
      method: order.payment?.method,
      transactionId: order.payment?.transactionId,
      status: order.status
    }));
  },
  
  // Retry failed payment
  async retryPayment(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    // Simulate retry
    const result = await this.processPayment({
      amount: order.total,
      orderId: orderId
    });
    
    if (result.success) {
      order.payment.transactionId = result.transactionId;
      order.status = 'confirmed';
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    return result;
  },
  
  // Request refund
  requestRefund(orderId, reason) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    if (order.status === 'refunded') {
      return { success: false, error: 'Order already refunded' };
    }
    
    // Create refund request
    const refundRequest = {
      orderId: orderId,
      date: new Date().toISOString(),
      amount: order.total,
      reason: reason,
      status: 'pending'
    };
    
    const refunds = JSON.parse(localStorage.getItem('refundRequests')) || [];
    refunds.push(refundRequest);
    localStorage.setItem('refundRequests', JSON.stringify(refunds));
    
    return { success: true, message: 'Refund request submitted' };
  }
};

// Make PaymentModule available globally
window.PaymentModule = PaymentModule;
