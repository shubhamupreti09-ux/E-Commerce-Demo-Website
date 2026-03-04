/**
 * Global UI Interactions and Utilities
 */
const App = {
  // Setup Mobile Menu Toggle
  initMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const links = document.getElementById('nav-links');
    
    if (btn && links) {
      btn.addEventListener('click', () => {
        links.classList.toggle('active');
        btn.classList.toggle('active');
      });
    }
  },

  // Highlight active navigation links dynamically
  initActiveLinks() {
    const links = document.querySelectorAll('.nav-link');
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const search = window.location.search;
    
    // Default matching
    links.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      
      // Match exactly the root path + search query
      if (href === path + search) {
        link.classList.add('active');
      } 
      // Match base path if it doesn't have a search params matching
      else if (href === path && search === '') {
        link.classList.add('active');
      }
    });

    // Handle edge case: if we are on 'shop.html' but with a category search,
    // don't leave the base "Shop" nav active if it was fallback matched.
    if (path === 'shop.html') {
      const specificCategoryActive = Array.from(links).some(l => l.classList.contains('active') && l.getAttribute('href').includes('?category='));
      
      links.forEach(l => {
        if (l.getAttribute('href') === 'shop.html') {
          if (specificCategoryActive) {
             l.classList.remove('active');
          } else if (search === '') {
             l.classList.add('active');
          }
        }
      });
    }
  },

  // Update Cart Badge globally
  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const cart = Store.getCart();
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      badge.textContent = count;
      
      if (count > 0) {
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
      }
    }
  },

  // Show Toast Notification
  showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
    
    toast.innerHTML = `
      <i class="ph ${icon}" style="font-size: 1.5rem"></i>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Global Add to Cart wrapper
  addToCart(productId, quantity = 1) {
    const product = Store.getProduct(productId);
    if (!product) return;

    const res = Store.addToCart(product, quantity);
    if (res.success) {
      this.updateCartBadge();
      this.showToast(`${product.name} added to cart!`, 'success');
    } else {
      this.showToast(res.message, 'error');
    }
  },

  // Format Currency
  formatMoney(amount) {
    return '$' + Number(amount).toFixed(2);
  }
};

// Initialize App globally
document.addEventListener('DOMContentLoaded', () => {
  App.initMobileMenu();
  App.initActiveLinks();
  App.updateCartBadge();
});
