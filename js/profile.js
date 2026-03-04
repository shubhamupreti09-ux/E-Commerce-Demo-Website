/**
 * Profile Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {

    const user = Store.getUser();
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }

    // Populate user UI
    document.getElementById('user-name').textContent = user.name || 'Customer';
    document.getElementById('user-email').textContent = user.email || '';
    const avatar = document.querySelector('.avatar');
    if (avatar) avatar.textContent = (user.name || 'C').charAt(0).toUpperCase();

    // Fill settings form with user data
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.querySelector('input[type="text"]').value = user.name || '';
        settingsForm.querySelector('input[type="email"]').value = user.email || '';
    }

    // Handles logout securely
    const logoutBtn = document.getElementById('tab-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('ecommerce_user');
            window.location.href = 'index.html';
        });
    }

    // Tab Navigation
    const tabs = ['orders', 'settings', 'wishlist'];
    
    tabs.forEach(tab => {
        const tabEl = document.getElementById(`tab-${tab}`);
        if (!tabEl) return;
        
        tabEl.addEventListener('click', (e) => {
            e.preventDefault();
            // hide all
            tabs.forEach(t => {
                document.getElementById(`tab-${t}`).classList.remove('active');
                document.getElementById(`content-${t}`).classList.add('hidden');
            });
            // show current
            document.getElementById(`tab-${tab}`).classList.add('active');
            document.getElementById(`content-${tab}`).classList.remove('hidden');
        });
    });

    // Load Orders
    function loadOrders() {
        const orders = Store.getOrders();
        const list = document.getElementById('orders-list');
        
        if (orders.length === 0) {
            list.innerHTML = `<div class="card" style="text-align:center; padding: 40px; color: var(--text-muted);">No orders found.</div>`;
            return;
        }

        list.innerHTML = orders.reverse().map(order => {
            const date = new Date(order.date).toLocaleDateString();
            const imgs = order.items.map(item => `<img src="${item.image}" class="order-item-img" title="${item.name}">`).join('');
            
            return `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <h4>Order ${order.id}</h4>
                            <span class="text-muted" style="font-size:0.9rem;">Placed on ${date}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight:bold; font-size: 1.1rem; margin-bottom:4px;">$${Number(order.total).toFixed(2)}</div>
                            <span class="order-status ${order.status === 'Processing' ? 'status-processing' : 'status-shipped'}">${order.status}</span>
                        </div>
                    </div>
                    <div>
                        <span class="text-muted" style="font-size:0.9rem; display:block; margin-bottom:8px;">Items Preview:</span>
                        <div class="order-items-preview">
                            ${imgs}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Load Wishlist
    function loadWishlist() {
        // use shop.css rules broadly
        const grid = document.getElementById('wishlist-grid');
        const wishlistIds = JSON.parse(localStorage.getItem('ecommerce_wishlist') || '[]');
        
        if (wishlistIds.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; color: var(--text-muted);">Your wishlist is empty.</div>`;
            return;
        }
        
        const products = Store.getProducts().filter(p => wishlistIds.includes(p.id));
        grid.innerHTML = products.map(product => `
            <div class="product-card card">
                <div class="product-img-wrapper" onclick="window.location.href='product.html?id=${product.id}'" style="cursor:pointer; height: 180px;">
                    <img src="${product.image}" alt="${product.name}" class="product-img">
                </div>
                <div class="product-info">
                    <h3 class="product-name" style="font-size:1rem;"><a href="product.html?id=${product.id}">${product.name}</a></h3>
                    <div class="product-price-action">
                        <span class="product-price" style="font-size:1.1rem;">$${Number(product.price).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Handle Settings Form
    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        App.showToast('Settings saved successfully!');
    });

    loadOrders();
    loadWishlist();
});
