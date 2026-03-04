/**
 * Product Details Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-container');
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = '<div style="text-align:center; padding: 100px;"><h2>Product Not Found</h2><a href="shop.html" class="btn btn-primary" style="margin-top: 20px;">Back to Shop</a></div>';
    return;
  }

  // Use a slight timeout to ensure Store is populated on very first load
  setTimeout(() => {
    const product = Store.getProduct(productId);
    
    if (!product) {
      container.innerHTML = '<div style="text-align:center; padding: 100px;"><h2>Product Not Found</h2><a href="shop.html" class="btn btn-primary" style="margin-top: 20px;">Back to Shop</a></div>';
      return;
    }

    renderProductDetail(product);
  }, 100);

  function renderProductDetail(product) {
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;
    
    let stockStatusHtml = `<span class="product-stock-status stock-in"><i class="ph ph-check-circle"></i> In Stock (${product.stock} available)</span>`;
    if (isOutOfStock) {
      stockStatusHtml = `<span class="product-stock-status stock-out"><i class="ph ph-x-circle"></i> Out of Stock</span>`;
    } else if (isLowStock) {
      stockStatusHtml = `<span class="product-stock-status stock-low"><i class="ph ph-warning-circle"></i> Low Stock (${product.stock} left)</span>`;
    }

    // Check if in wishlist (mocking functionality via localStorage simple array if user desires, or just UI for now)
    const wishlist = JSON.parse(localStorage.getItem('ecommerce_wishlist') || '[]');
    const isWished = wishlist.includes(product.id);

    const html = `
      <div class="product-breadcrumb">
          <a href="index.html">Home</a> &gt; <a href="shop.html?category=${product.category}">${product.category}</a> &gt; <span>${product.name}</span>
      </div>

      <div class="product-detail-layout card" style="background: var(--bg-color);">
          <!-- Gallery -->
          <div class="product-gallery">
              ${product.isFeatured ? '<div class="badge float-badge" style="z-index:10; background: var(--primary-color);">Featured</div>' : ''}
              <div class="main-image-wrapper">
                  <img src="${product.image}" id="main-img" alt="${product.name}">
              </div>
              <div class="thumbnail-gallery">
                  <!-- Just mocking multiple thumbnails using the same image for demo -->
                  <img src="${product.image}" class="active" onclick="document.getElementById('main-img').src=this.src">
                  <img src="${product.image}" onclick="document.getElementById('main-img').src=this.src" style="filter: grayscale(100%);">
                  <img src="${product.image}" onclick="document.getElementById('main-img').src=this.src" style="filter: sepia(100%);">
              </div>
          </div>

          <!-- Info -->
          <div class="product-info-section">
              <h1 class="product-title">${product.name}</h1>
              
              <div class="product-price-section">
                  $${Number(product.price).toFixed(2)}
                  ${stockStatusHtml}
              </div>

              <p class="product-description">
                  ${product.description}
                  <br><br>
                  Designed with cutting-edge technology and premium materials, this product ensures maximum performance and durability. Perfect for both professionals and enthusiasts looking for the ultimate experience.
              </p>

              <div class="add-to-cart-form">
                  <div class="quantity-selector">
                      <span style="font-weight: 500; color: var(--text-muted);">Quantity:</span>
                      <div class="qty-controls">
                          <button class="qty-btn" id="qty-minus" ${isOutOfStock ? 'disabled' : ''}>-</button>
                          <input type="text" id="qty-input" class="qty-input" value="1" readonly>
                          <button class="qty-btn" id="qty-plus" ${isOutOfStock ? 'disabled' : ''}>+</button>
                      </div>
                  </div>

                  <div class="action-buttons">
                      <button class="btn btn-primary" id="btn-add-cart" ${isOutOfStock ? 'disabled' : ''}>
                          <i class="ph ph-shopping-cart-simple"></i> Add to Cart
                      </button>
                      <button class="btn btn-secondary wishlist-btn ${isWished ? 'active' : ''}" id="btn-wishlist">
                          <i class="ph ph-heart"></i>
                      </button>
                  </div>
              </div>

              <div class="product-features">
                  <div class="feature-item"><i class="ph ph-shield-check"></i> 1 Year Warranty</div>
                  <div class="feature-item"><i class="ph ph-truck"></i> Free Fast Delivery</div>
                  <div class="feature-item"><i class="ph ph-arrow-u-up-left"></i> 30-Day Returns</div>
                  <div class="feature-item"><i class="ph ph-lock-key"></i> Secure Checkout</div>
              </div>
          </div>
      </div>
    `;

    container.innerHTML = html;

    // Attach interactions
    if (!isOutOfStock) {
      const qtyInput = document.getElementById('qty-input');
      
      document.getElementById('qty-minus').addEventListener('click', () => {
        let val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
      });

      document.getElementById('qty-plus').addEventListener('click', () => {
        let val = parseInt(qtyInput.value);
        if (val < product.stock) qtyInput.value = val + 1;
      });

      document.getElementById('btn-add-cart').addEventListener('click', () => {
        const qty = parseInt(qtyInput.value);
        App.addToCart(product.id, qty);
      });
    }

    // Wishlist toggle
    const btnWishlist = document.getElementById('btn-wishlist');
    btnWishlist.addEventListener('click', () => {
      let w = JSON.parse(localStorage.getItem('ecommerce_wishlist') || '[]');
      const isAlreadyWished = w.includes(product.id);
      
      if (isAlreadyWished) {
        w = w.filter(id => id !== product.id);
        btnWishlist.classList.remove('active');
        App.showToast('Removed from wishlist');
      } else {
        w.push(product.id);
        btnWishlist.classList.add('active');
        App.showToast('Added to wishlist');
      }
      localStorage.setItem('ecommerce_wishlist', JSON.stringify(w));
    });
  }
});
