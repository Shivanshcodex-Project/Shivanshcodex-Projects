// ============================================
// ShopEase E-Commerce - Checkout Module
// ============================================

const CheckoutModule = {
  // Address validation
  validateAddress(address) {
    const errors = [];
    
    if (!address.fullName || address.fullName.trim().length < 3) {
      errors.push('Full name must be at least 3 characters');
    }
    
    if (!address.phone || !/^\d{10}$/.test(address.phone)) {
      errors.push('Please enter a valid 10-digit phone number');
    }
    
    if (!address.pincode || !/^\d{6}$/.test(address.pincode)) {
      errors.push('Please enter a valid 6-digit pincode');
    }
    
    if (!address.city || address.city.trim().length < 2) {
      errors.push('Please enter a valid city name');
    }
    
    if (!address.state) {
      errors.push('Please select a state');
    }
    
    if (!address.address || address.address.trim().length < 10) {
      errors.push('Please enter a complete address (at least 10 characters)');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  // Save address to localStorage
  saveAddress(address) {
    const validation = this.validateAddress(address);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    
    let addresses = JSON.parse(localStorage.getItem('savedAddresses')) || [];
    
    // Check if address already exists
    const existingIndex = addresses.findIndex(a => 
      a.phone === address.phone && a.pincode === address.pincode
    );
    
    if (existingIndex !== -1) {
      addresses[existingIndex] = address;
    } else {
      addresses.push(address);
    }
    
    localStorage.setItem('savedAddresses', JSON.stringify(addresses));
    localStorage.setItem('currentAddress', JSON.stringify(address));
    
    return { success: true };
  },
  
  // Get saved addresses
  getSavedAddresses() {
    return JSON.parse(localStorage.getItem('savedAddresses')) || [];
  },
  
  // Get current address
  getCurrentAddress() {
    return JSON.parse(localStorage.getItem('currentAddress'));
  },
  
  // Delete saved address
  deleteAddress(index) {
    let addresses = JSON.parse(localStorage.getItem('savedAddresses')) || [];
    addresses.splice(index, 1);
    localStorage.setItem('savedAddresses', JSON.stringify(addresses));
    return true;
  },
  
  // Set default address
  setDefaultAddress(index) {
    let addresses = JSON.parse(localStorage.getItem('savedAddresses')) || [];
    addresses.forEach((addr, i) => {
      addr.isDefault = i === index;
    });
    localStorage.setItem('savedAddresses', JSON.stringify(addresses));
  },
  
  // Get delivery estimate based on pincode
  getDeliveryEstimate(pincode) {
    // In a real app, this would check against a delivery database
    const estimates = {
      '560001': 1, // Bangalore
      '110001': 2, // Delhi
      '400001': 2, // Mumbai
      '600001': 3, // Chennai
      '700001': 3, // Kolkata
      '500001': 2  // Hyderabad
    };
    
    const cityCode = pincode.substring(0, 3);
    const days = estimates[cityCode + '001'] || 3;
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    
    return {
      days: days,
      date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      isExpress: days === 1
    };
  },
  
  // Check if COD is available for pincode
  isCodAvailable(pincode) {
    // In a real app, this would check against a serviceability database
    const nonCodPincodes = ['000000']; // Example
    return !nonCodPincodes.includes(pincode);
  },
  
  // Calculate delivery charges
  calculateDeliveryCharges(pincode, orderTotal) {
    // Free delivery for orders above ₹500
    if (orderTotal >= 500) {
      return 0;
    }
    
    // Standard delivery charge
    return 40;
  },
  
  // Prepare checkout data
  prepareCheckoutData() {
    const cartSummary = CartModule.getCartSummary();
    const address = this.getCurrentAddress();
    
    if (!address) {
      return { success: false, error: 'Please add a delivery address' };
    }
    
    if (cartSummary.itemCount === 0) {
      return { success: false, error: 'Your cart is empty' };
    }
    
    const deliveryEstimate = this.getDeliveryEstimate(address.pincode);
    const deliveryCharges = this.calculateDeliveryCharges(address.pincode, cartSummary.subtotal);
    
    const checkoutData = {
      items: cartSummary.items,
      address: address,
      pricing: {
        subtotal: cartSummary.mrpTotal,
        productDiscount: cartSummary.totalSavings,
        couponDiscount: cartSummary.couponDiscount || 0,
        deliveryCharges: deliveryCharges,
        platformFee: 3,
        total: cartSummary.subtotal - (cartSummary.couponDiscount || 0) + deliveryCharges + 3
      },
      deliveryEstimate: deliveryEstimate,
      codAvailable: this.isCodAvailable(address.pincode)
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    return { success: true, data: checkoutData };
  },
  
  // Get checkout data
  getCheckoutData() {
    return JSON.parse(localStorage.getItem('checkoutData'));
  },
  
  // Clear checkout data
  clearCheckoutData() {
    localStorage.removeItem('checkoutData');
    localStorage.removeItem('currentAddress');
  }
};

// Make CheckoutModule available globally
window.CheckoutModule = CheckoutModule;
