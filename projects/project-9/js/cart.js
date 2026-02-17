// ============================================
// ShopEase E-Commerce - Cart Module
// Additional cart-specific functionality
// ============================================

// Cart module for advanced cart operations
const CartModule = {
  // Save for later functionality
  savedForLater: JSON.parse(localStorage.getItem('savedForLater')) || [],
  
  // Save item for later
  saveForLater(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) return false;
    
    const item = cart[itemIndex];
    this.savedForLater.push(item);
    localStorage.setItem('savedForLater', JSON.stringify(this.savedForLater));
    
    // Remove from cart
    cart.splice(itemIndex, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    updateCartCount();
    showToast('Item saved for later!', 'success');
    return true;
  },
  
  // Move saved item back to cart
  moveToCart(productId) {
    const itemIndex = this.savedForLater.findIndex(item => item.id === productId);
    if (itemIndex === -1) return false;
    
    const item = this.savedForLater[itemIndex];
    
    // Add to cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(cartItem => cartItem.id === productId);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Remove from saved
    this.savedForLater.splice(itemIndex, 1);
    localStorage.setItem('savedForLater', JSON.stringify(this.savedForLater));
    
    updateCartCount();
    showToast('Item moved to cart!', 'success');
    return true;
  },
  
  // Get saved items with product details
  getSavedItems() {
    return this.savedForLater.map(item => {
      const product = getProductById(item.id);
      return { ...product, quantity: item.quantity };
    });
  },
  
  // Apply coupon code
  applyCoupon(code) {
    const coupons = {
      'SAVE10': { discount: 10, type: 'percent', maxDiscount: 1000 },
      'SAVE20': { discount: 20, type: 'percent', maxDiscount: 2000 },
      'WELCOME': { discount: 15, type: 'percent', maxDiscount: 500 },
      'FIRST50': { discount: 50, type: 'percent', maxDiscount: 5000 },
      'FLAT100': { discount: 100, type: 'fixed', maxDiscount: 100 },
      'FLAT500': { discount: 500, type: 'fixed', maxDiscount: 500 }
    };
    
    const coupon = coupons[code.toUpperCase()];
    if (!coupon) return { success: false, message: 'Invalid coupon code' };
    
    const cartTotal = getCartTotal();
    let discount = 0;
    
    if (coupon.type === 'percent') {
      discount = Math.floor(cartTotal * coupon.discount / 100);
      discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discount;
    }
    
    // Save applied coupon
    localStorage.setItem('appliedCoupon', JSON.stringify({
      code: code.toUpperCase(),
      discount: discount
    }));
    
    return { 
      success: true, 
      discount: discount,
      message: `Coupon applied! You saved ${formatPrice(discount)}`
    };
  },
  
  // Remove applied coupon
  removeCoupon() {
    localStorage.removeItem('appliedCoupon');
    return { success: true, message: 'Coupon removed' };
  },
  
  // Get applied coupon
  getAppliedCoupon() {
    return JSON.parse(localStorage.getItem('appliedCoupon'));
  },
  
  // Calculate final total with coupon
  getFinalTotal() {
    const cartTotal = getCartTotal();
    const coupon = this.getAppliedCoupon();
    const platformFee = 3;
    
    let discount = coupon ? coupon.discount : 0;
    return cartTotal - discount + platformFee;
  },
  
  // Check if cart has items from specific category
  hasCategory(category) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.some(item => {
      const product = getProductById(item.id);
      return product && product.category === category;
    });
  },
  
  // Get cart summary
  getCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const items = cart.map(item => {
      const product = getProductById(item.id);
      return {
        ...product,
        quantity: item.quantity,
        itemTotal: product.price * item.quantity,
        itemMRP: product.mrp * item.quantity,
        itemSavings: (product.mrp - product.price) * item.quantity
      };
    });
    
    const summary = {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.itemTotal, 0),
      mrpTotal: items.reduce((sum, item) => sum + item.itemMRP, 0),
      totalSavings: items.reduce((sum, item) => sum + item.itemSavings, 0),
      items: items
    };
    
    const coupon = this.getAppliedCoupon();
    if (coupon) {
      summary.couponDiscount = coupon.discount;
      summary.finalTotal = summary.subtotal - coupon.discount + 3; // 3 is platform fee
    } else {
      summary.finalTotal = summary.subtotal + 3;
    }
    
    return summary;
  },
  
  // Merge cart after login (for guest users)
  mergeCart(guestCart) {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    guestCart.forEach(guestItem => {
      const existingItem = currentCart.find(item => item.id === guestItem.id);
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        currentCart.push(guestItem);
      }
    });
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    updateCartCount();
  },
  
  // Export cart data
  exportCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return JSON.stringify(cart);
  },
  
  // Import cart data
  importCart(cartData) {
    try {
      const cart = JSON.parse(cartData);
      if (Array.isArray(cart)) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid cart data:', e);
      return false;
    }
  }
};

// Make CartModule available globally
window.CartModule = CartModule;
