// ============================================
// ShopEase E-Commerce - Tracking Module
// ============================================

const TrackingModule = {
  // Tracking stages configuration
  stages: [
    { 
      key: 'confirmed', 
      label: 'Order Confirmed', 
      description: 'Your order has been confirmed and is being processed',
      icon: 'check-circle',
      estimatedTime: 0
    },
    { 
      key: 'packed', 
      label: 'Packed', 
      description: 'Your order has been packed and is ready for shipping',
      icon: 'package',
      estimatedTime: 2 // hours
    },
    { 
      key: 'shipped', 
      label: 'Shipped', 
      description: 'Your order has been shipped and is on its way',
      icon: 'truck',
      estimatedTime: 24 // hours
    },
    { 
      key: 'out-for-delivery', 
      label: 'Out for Delivery', 
      description: 'Your order is out for delivery today',
      icon: 'map-pin',
      estimatedTime: 48 // hours
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      description: 'Your order has been delivered successfully',
      icon: 'home',
      estimatedTime: 50 // hours
    }
  ],
  
  // Get tracking info for an order
  getTrackingInfo(orderId) {
    const order = OrdersModule.getOrder(orderId);
    if (!order) return null;
    
    const currentStageIndex = order.statusIndex || 0;
    const currentStage = this.stages[currentStageIndex];
    
    // Calculate progress percentage
    const progress = ((currentStageIndex + 1) / this.stages.length) * 100;
    
    // Generate timeline
    const timeline = this.generateTimeline(order);
    
    return {
      orderId: orderId,
      trackingNumber: order.trackingNumber,
      currentStatus: currentStage.label,
      currentStatusKey: currentStage.key,
      progress: progress,
      estimatedDelivery: this.calculateEstimatedDelivery(order),
      timeline: timeline,
      carrier: this.getCarrierInfo(order.trackingNumber),
      address: order.address
    };
  },
  
  // Generate timeline for order
  generateTimeline(order) {
    const orderDate = new Date(order.date);
    const currentStatusIndex = order.statusIndex || 0;
    
    return this.stages.map((stage, index) => {
      const isCompleted = index <= currentStatusIndex;
      const isCurrent = index === currentStatusIndex;
      
      // Calculate estimated time for this stage
      const stageDate = new Date(orderDate);
      stageDate.setHours(stageDate.getHours() + stage.estimatedTime);
      
      // If completed, use actual time from order timeline
      let actualDate = null;
      if (order.timeline) {
        const timelineEntry = order.timeline.find(t => 
          t.status.toLowerCase().includes(stage.label.toLowerCase())
        );
        if (timelineEntry) {
          actualDate = timelineEntry.date;
        }
      }
      
      return {
        stage: stage.label,
        description: stage.description,
        icon: stage.icon,
        isCompleted: isCompleted,
        isCurrent: isCurrent,
        estimatedDate: stageDate.toISOString(),
        actualDate: actualDate,
        location: this.getStageLocation(order.address, index)
      };
    });
  },
  
  // Calculate estimated delivery date
  calculateEstimatedDelivery(order) {
    const orderDate = new Date(order.date);
    const deliveryDays = order.items?.[0]?.deliveryDays || 3;
    
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
    
    return {
      date: estimatedDate.toISOString(),
      formatted: estimatedDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      timeRange: '9:00 AM - 7:00 PM'
    };
  },
  
  // Get carrier information
  getCarrierInfo(trackingNumber) {
    // In a real app, this would determine carrier from tracking number
    const carriers = [
      { name: 'Delhivery', phone: '0124-6716500', website: 'https://www.delhivery.com' },
      { name: 'Blue Dart', phone: '1860-233-1234', website: 'https://www.bluedart.com' },
      { name: 'FedEx', phone: '1800-22-6161', website: 'https://www.fedex.com' },
      { name: 'Ecom Express', phone: '8376-888-222', website: 'https://www.ecomexpress.in' }
    ];
    
    // Return random carrier for demo
    return carriers[Math.floor(Math.random() * carriers.length)];
  },
  
  // Get stage location (simulated)
  getStageLocation(address, stageIndex) {
    if (!address) return 'Processing Center';
    
    const locations = [
      'Seller Facility',
      'Sorting Center',
      'Transit Hub',
      `${address.city} Distribution Center`,
      address.city
    ];
    
    return locations[stageIndex] || address.city;
  },
  
  // Simulate order progress (for demo purposes)
  simulateProgress(orderId) {
    const orders = OrdersModule.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return null;
    
    const orderDate = new Date(order.date);
    const now = new Date();
    const hoursSinceOrder = (now - orderDate) / (1000 * 60 * 60);
    
    // Determine status based on time elapsed
    let newStatusIndex = 0;
    if (hoursSinceOrder > 1) newStatusIndex = 1; // Packed after 1 hour
    if (hoursSinceOrder > 4) newStatusIndex = 2; // Shipped after 4 hours
    if (hoursSinceOrder > 24) newStatusIndex = 3; // Out for delivery after 24 hours
    if (hoursSinceOrder > 48) newStatusIndex = 4; // Delivered after 48 hours
    
    // Update order if status changed
    if (newStatusIndex > (order.statusIndex || 0)) {
      order.statusIndex = newStatusIndex;
      order.status = this.stages[newStatusIndex].key;
      
      // Add timeline entry
      if (!order.timeline) order.timeline = [];
      
      for (let i = order.timeline.length; i <= newStatusIndex; i++) {
        const stageDate = new Date(orderDate);
        stageDate.setHours(stageDate.getHours() + this.stages[i].estimatedTime);
        
        order.timeline.push({
          status: this.stages[i].label,
          date: stageDate.toISOString(),
          description: this.stages[i].description
        });
      }
      
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    return this.getTrackingInfo(orderId);
  },
  
  // Get live tracking updates (simulated)
  async getLiveUpdates(orderId) {
    // In a real app, this would poll an API
    return new Promise((resolve) => {
      setTimeout(() => {
        const info = this.simulateProgress(orderId);
        resolve(info);
      }, 1000);
    });
  },
  
  // Subscribe to tracking updates
  subscribeToUpdates(orderId, callback) {
    // Poll for updates every 30 seconds
    const intervalId = setInterval(async () => {
      const info = await this.getLiveUpdates(orderId);
      callback(info);
    }, 30000);
    
    // Return unsubscribe function
    return () => clearInterval(intervalId);
  },
  
  // Format tracking number for display
  formatTrackingNumber(number) {
    if (!number) return '';
    return number.replace(/(.{3})/g, '$1 ').trim();
  },
  
  // Get tracking URL for external carrier
  getCarrierTrackingUrl(trackingNumber, carrier) {
    const urls = {
      'Delhivery': `https://www.delhivery.com/track/?tracking_id=${trackingNumber}`,
      'Blue Dart': `https://www.bluedart.com/tracking`,
      'FedEx': `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`,
      'Ecom Express': `https://www.ecomexpress.in/track/${trackingNumber}`
    };
    
    return urls[carrier] || '#';
  },
  
  // Render tracking map (simulated)
  renderTrackingMap(containerId, orderId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const order = OrdersModule.getOrder(orderId);
    if (!order || !order.address) return;
    
    // For demo, show a placeholder map
    container.innerHTML = `
      <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); 
                  height: 300px; 
                  border-radius: 12px; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                  flex-direction: column;
                  color: var(--primary);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 12px;">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p style="font-weight: 600;">Delivery Location</p>
        <p style="font-size: 0.9rem; margin-top: 4px;">${order.address.city}, ${order.address.state}</p>
        <p style="font-size: 0.8rem; margin-top: 8px; opacity: 0.8;">Pincode: ${order.address.pincode}</p>
      </div>
    `;
  }
};

// Make TrackingModule available globally
window.TrackingModule = TrackingModule;
