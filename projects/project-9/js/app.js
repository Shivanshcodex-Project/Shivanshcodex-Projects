// ============================================
// ShopEase E-Commerce - Main Application JavaScript
// ============================================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart count on page load
  updateCartCount();
  
  // Initialize theme if saved
  initTheme();
  
  // Add scroll effects
  initScrollEffects();
});

// ============================================
// CART FUNCTIONS
// ============================================

// Update cart count in header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    
    // Animate cart count
    if (count > 0) {
      cartCountEl.style.animation = 'none';
      setTimeout(() => {
        cartCountEl.style.animation = 'pulse 0.3s ease';
      }, 10);
    }
  }
}

// Add item to cart
function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) return false;
  
  if (product.stock === 0) {
    showToast('Sorry, this product is out of stock!', 'error');
    return false;
  }
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      showToast(`Only ${product.stock} items available in stock!`, 'warning');
      return false;
    }
    existingItem.quantity = newQuantity;
  } else {
    cart.push({ id: productId, quantity: quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Added to cart!', 'success');
  return true;
}

// Remove item from cart
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Update item quantity in cart
function updateCartQuantity(productId, quantity) {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }
  
  const product = getProductById(productId);
  if (!product) return;
  
  if (quantity > product.stock) {
    showToast(`Only ${product.stock} items available!`, 'warning');
    return;
  }
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
  }
}

// Get cart total
function getCartTotal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  return cart.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

// Clear cart
function clearCart() {
  localStorage.removeItem('cart');
  updateCartCount();
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icon based on type
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };
  
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Remove after duration
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

// ============================================
// THEME FUNCTIONS
// ============================================

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Toggle theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// ============================================
// SCROLL EFFECTS
// ============================================

// Initialize scroll effects
function initScrollEffects() {
  // Header shadow on scroll
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.style.boxShadow = 'var(--shadow-lg)';
      } else {
        header.style.boxShadow = 'var(--shadow-md)';
      }
    });
  }
  
  // Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe product cards
  document.querySelectorAll('.product-card, .category-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Generate random ID
function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone
function isValidPhone(phone) {
  const re = /^\d{10}$/;
  return re.test(phone);
}

// Validate pincode
function isValidPincode(pincode) {
  const re = /^\d{6}$/;
  return re.test(pincode);
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

// Save to localStorage with expiry
function setWithExpiry(key, value, ttl) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Get from localStorage with expiry check
function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  
  const item = JSON.parse(itemStr);
  const now = new Date();
  
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return item.value;
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

// Global search handler
function handleGlobalSearch(event) {
  event.preventDefault();
  const input = event.target.querySelector('input');
  const query = input ? input.value.trim() : '';
  
  if (query) {
    window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
  }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

// Navigate to product page
function navigateToProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

// Navigate to category
function navigateToCategory(category) {
  window.location.href = `shop.html?category=${encodeURIComponent(category)}`;
}

// Go back
function goBack() {
  window.history.back();
}

// ============================================
// WISHLIST FUNCTIONS
// ============================================

// Get wishlist
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

// Add to wishlist
function addToWishlist(productId) {
  let wishlist = getWishlist();
  
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    showToast('Added to wishlist!', 'success');
    return true;
  } else {
    showToast('Already in wishlist!', 'info');
    return false;
  }
}

// Remove from wishlist
function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  showToast('Removed from wishlist!', 'success');
}

// Toggle wishlist
function toggleWishlist(productId) {
  const wishlist = getWishlist();
  if (wishlist.includes(productId)) {
    removeFromWishlist(productId);
  } else {
    addToWishlist(productId);
  }
}

// Check if in wishlist
function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

// ============================================
// USER FUNCTIONS
// ============================================

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Login user
function loginUser(userData) {
  localStorage.setItem('user', JSON.stringify(userData));
}

// Logout user
function logoutUser() {
  localStorage.removeItem('user');
  showToast('Logged out successfully!', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// ============================================
// ANALYTICS / TRACKING (Simulated)
// ============================================

// Track page view
function trackPageView(page) {
  console.log(`Page view: ${page}`);
  // In a real app, this would send data to analytics service
}

// Track event
function trackEvent(eventName, data = {}) {
  console.log(`Event: ${eventName}`, data);
  // In a real app, this would send data to analytics service
}

// ============================================
// SERVICE WORKER REGISTRATION (For PWA)
// ============================================

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  // In a real app, this would send error to monitoring service
  return false;
};

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  // In a real app, this would send error to monitoring service
});

// Export functions for use in other scripts
window.ShopEase = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCartTotal,
  clearCart,
  updateCartCount,
  showToast,
  toggleTheme,
  formatPrice,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getRelatedProducts,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  isInWishlist,
  isLoggedIn,
  getCurrentUser,
  loginUser,
  logoutUser,
  generateId,
  formatDate,
  formatTime,
  isValidEmail,
  isValidPhone,
  isValidPincode
};
