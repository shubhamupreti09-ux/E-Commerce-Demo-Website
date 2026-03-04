/**
 * Shop Page Logic
 * Handles filtering, sorting, rendering products, and smart search.
 */
document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('shop-product-grid');
  const resultsCount = document.getElementById('results-count');
  
  // Filters
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  const priceRange = document.getElementById('price-range');
  const priceValue = document.getElementById('price-value');
  const inStockCheckbox = document.getElementById('in-stock-only');
  const sortSelect = document.getElementById('sort-select');
  const clearBtn = document.getElementById('clear-filters');
  
  // Search
  const searchInput = document.getElementById('search-input');
  const searchSuggestions = document.getElementById('search-suggestions');

  // Filter Toggle Button
  const filterToggleBtn = document.getElementById('filter-toggle-btn');
  const filterContentWrapper = document.getElementById('filter-content-wrapper');
  const filterArrow = document.getElementById('filter-arrow');

  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', () => {
      filterContentWrapper.classList.toggle('active');
      filterArrow.textContent = filterContentWrapper.classList.contains('active') ? '▲' : '▼';
    });
  }

  let allProducts = Store.getProducts();

  // URL parameters handling
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory) {
    const radio = document.querySelector(`input[name="category"][value="${initialCategory}"]`);
    if (radio) radio.checked = true;
  }

  // --- RENDERING ---
  function renderProducts() {
    allProducts = Store.getProducts(); // refresh
    let filtered = [...allProducts];

    // Category Filter
    const activeCategory = document.querySelector('input[name="category"]:checked').value;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Price Filter
    const maxPrice = parseFloat(priceRange.value);
    filtered = filtered.filter(p => p.price <= maxPrice);

    // Stock Filter
    if (inStockCheckbox.checked) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sorting
    const sortBy = sortSelect.value;
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'featured') {
      // sort featured first
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    // Display
    resultsCount.textContent = `Showing ${filtered.length} products`;
    productGrid.innerHTML = '';

    if (filtered.length === 0) {
      productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No products found matching your criteria.</div>';
      return;
    }

    filtered.forEach(product => {
      const isOutOfStock = product.stock === 0;
      const html = `
        <div class="product-card card ${isOutOfStock ? 'out-of-stock' : ''}" style="${isOutOfStock ? 'opacity: 0.6;' : ''}">
            <div class="product-img-wrapper" onclick="window.location.href='product.html?id=${product.id}'" style="cursor:pointer;">
                <img src="${product.image}" alt="${product.name}" class="product-img">
                ${product.stock <= 5 && product.stock > 0 ? '<span class="badge float-badge">Low Stock</span>' : ''}
                ${isOutOfStock ? '<span class="badge float-badge" style="background:var(--text-muted)">Out of Stock</span>' : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
                <div class="product-price-action">
                    <span class="product-price">$${Number(product.price).toFixed(2)}</span>
                    <button class="btn-icon" ${isOutOfStock ? 'disabled' : ''} onclick="App.addToCart('${product.id}')" aria-label="Add to cart">
                        <i class="ph ph-shopping-cart-simple"></i>
                    </button>
                </div>
            </div>
        </div>
      `;
      productGrid.insertAdjacentHTML('beforeend', html);
    });
  }

  // --- EVENT LISTENERS ---
  categoryRadios.forEach(radio => radio.addEventListener('change', renderProducts));
  
  priceRange.addEventListener('input', (e) => {
    priceValue.textContent = `$${e.target.value}`;
    renderProducts();
  });
  
  inStockCheckbox.addEventListener('change', renderProducts);
  sortSelect.addEventListener('change', renderProducts);

  clearBtn.addEventListener('click', () => {
    document.querySelector('input[name="category"][value="all"]').checked = true;
    priceRange.value = 1000;
    priceValue.textContent = '$1000+';
    inStockCheckbox.checked = false;
    sortSelect.value = 'featured';
    renderProducts();
  });

  // --- SMART SEARCH AUTOCOMPLETE ---
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length < 2) {
      searchSuggestions.classList.remove('active');
      return;
    }

    const matches = allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    ).slice(0, 5); // limit to 5 suggestions

    if (matches.length > 0) {
      searchSuggestions.innerHTML = matches.map(m => `
        <div class="suggestion-item" onclick="window.location.href='product.html?id=${m.id}'">
          <img src="${m.image}" alt="${m.name}">
          <div class="suggestion-item-info">
            <span class="suggestion-title">${m.name}</span>
            <span class="suggestion-price">$${Number(m.price).toFixed(2)}</span>
          </div>
        </div>
      `).join('');
      searchSuggestions.classList.add('active');
    } else {
      searchSuggestions.innerHTML = '<div class="suggestion-item"><span class="suggestion-title" style="color:var(--text-muted)">No matching products</span></div>';
      searchSuggestions.classList.add('active');
    }
  });

  // Hide suggestions if clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
      searchSuggestions.classList.remove('active');
    }
  });

  // Initial Render
  setTimeout(renderProducts, 100); // small delay to ensure Store loads
});
