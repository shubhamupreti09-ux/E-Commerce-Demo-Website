/**
 * Admin Dashboard Logic
 */
document.addEventListener('DOMContentLoaded', () => {

    const FIX_PASSWORD = 'admin123';
    
    // Check session login state
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (isLoggedIn) {
        document.getElementById('admin-login-overlay').style.display = 'none';
        document.getElementById('admin-wrapper').style.display = 'flex';
        // Delay load to ensure DOM painted
        setTimeout(loadDashboardStats, 50);
    }

    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = document.getElementById('admin-password').value;
        if (pwd === FIX_PASSWORD) {
            sessionStorage.setItem('admin_logged_in', 'true');
            document.getElementById('admin-login-overlay').style.display = 'none';
            document.getElementById('admin-wrapper').style.display = 'flex';
            App.showToast('Login Successful', 'success');
            loadDashboardStats();
        } else {
            App.showToast('Incorrect password', 'error');
            document.getElementById('admin-password').value = '';
        }
    });

    // Logout handling (can append to brand logo for demo or similar)
    // Here we'll just expose a simple global func
    window.adminLogout = () => {
        sessionStorage.removeItem('admin_logged_in');
        window.location.reload();
    };

    // Tab Navigation
    const views = ['dashboard', 'products', 'inventory', 'discounts'];
    
    views.forEach(view => {
        document.getElementById(`nav-${view}`).addEventListener('click', (e) => {
            e.preventDefault();
            // Hide all
            views.forEach(v => {
                document.getElementById(`nav-${v}`).classList.remove('active');
                document.getElementById(`view-${v}`).classList.add('hidden');
            });
            // Show current
            document.getElementById(`nav-${view}`).classList.add('active');
            document.getElementById(`view-${view}`).classList.remove('hidden');

            const titleMap = {
                'dashboard': 'Dashboard Overview',
                'products': 'Product Catalog',
                'inventory': 'Inventory Tracking',
                'discounts': 'Campaigns'
            };
            document.getElementById('page-title').textContent = titleMap[view];
            
            // Re-render data on tab switch to be safe
            if (view === 'products') renderProductsTable();
            if (view === 'inventory') renderInventoryTable();
        });
    });

    // --- Loading Dashboard Data ---
    function loadDashboardStats() {
        const orders = Store.getOrders();
        const products = Store.getProducts();

        const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
        document.getElementById('stat-revenue').textContent = '$' + totalRev.toFixed(2);
        document.getElementById('stat-orders').textContent = orders.length;
        document.getElementById('stat-products').textContent = products.length;

        const lowStockProducts = products.filter(p => p.stock <= 5);
        document.getElementById('stat-low-stock').textContent = lowStockProducts.length;

        if (lowStockProducts.length > 0) {
            document.getElementById('alert-badge').style.display = 'inline-block';
            document.getElementById('low-stock-stat').style.border = '1px solid var(--danger-color)';
        } else {
            document.getElementById('alert-badge').style.display = 'none';
        }

        // Recent Orders Table
        const recentOrders = [...orders].reverse().slice(0, 5);
        const tbody = document.querySelector('#recent-orders-table tbody');
        if (recentOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No orders yet.</td></tr>';
        } else {
            tbody.innerHTML = recentOrders.map(o => `
                <tr>
                    <td>${o.id}</td>
                    <td>${new Date(o.date).toLocaleDateString()}</td>
                    <td>${o.user}</td>
                    <td>$${Number(o.total).toFixed(2)}</td>
                    <td><span class="status-badge ${o.status === 'Processing' ? 'low-stock' : 'in-stock'}">${o.status}</span></td>
                </tr>
            `).join('');
        }
    }

    // --- Product Management ---
    function renderProductsTable() {
        const products = Store.getProducts();
        const tbody = document.querySelector('#products-table tbody');
        
        tbody.innerHTML = products.map(p => `
            <tr>
                <td><img src="${p.image}" alt=""></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>$${Number(p.price).toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon" style="color:var(--danger-color)" onclick="deleteProduct('${p.id}')" title="Delete"><i class="ph ph-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    // --- Inventory Management ---
    function renderInventoryTable() {
        const products = Store.getProducts();
        const tbody = document.querySelector('#inventory-table tbody');
        
        // sort by lowest stock first
        const sorted = [...products].sort((a,b) => a.stock - b.stock);

        tbody.innerHTML = sorted.map(p => {
            let status = 'in-stock';
            let label = 'In Stock';
            if (p.stock === 0) { status = 'out-of-stock'; label = 'Out of Stock'; }
            else if (p.stock <= 5) { status = 'low-stock'; label = 'Low Stock'; }

            return `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${p.image}" style="width:40px;height:40px;">
                            <span>${p.name}</span>
                        </div>
                    </td>
                    <td><strong style="font-size:1.1rem;">${p.stock}</strong> units</td>
                    <td><span class="status-badge ${status}">${label}</span></td>
                    <td>
                        <div style="display:flex; gap:8px;">
                            <input type="number" id="quick-stock-${p.id}" class="input-control" value="${p.stock}" style="width:80px; padding: 8px;">
                            <button class="btn btn-primary" style="padding: 8px 16px;" onclick="updateFastStock('${p.id}')">Update</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.updateFastStock = (id) => {
        const val = parseInt(document.getElementById(`quick-stock-${id}`).value);
        if (val >= 0) {
            const products = Store.getProducts();
            const idx = products.findIndex(p => p.id === id);
            products[idx].stock = val;
            Store.setProducts(products);
            
            App.showToast('Inventory updated', 'success');
            renderInventoryTable();
            loadDashboardStats();
        }
    };

    // --- Product Modal Form Logic ---
    const modal = document.getElementById('product-modal-overlay');
    const form = document.getElementById('product-form');

    window.openProductModal = () => {
        form.reset();
        document.getElementById('prod-id').value = '';
        document.getElementById('product-modal-title').textContent = 'Add New Product';
        modal.classList.remove('hidden');
    };

    window.closeProductModal = () => {
        modal.classList.add('hidden');
    };

    window.editProduct = (id) => {
        const product = Store.getProduct(id);
        if (product) {
            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-price').value = product.price;
            document.getElementById('prod-stock').value = product.stock;
            document.getElementById('prod-category').value = product.category;
            document.getElementById('prod-image').value = product.image;
            document.getElementById('prod-description').value = product.description;
            document.getElementById('prod-featured').checked = product.isFeatured;
            
            document.getElementById('product-modal-title').textContent = 'Edit Product';
            modal.classList.remove('hidden');
        }
    };

    window.deleteProduct = (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            const products = Store.getProducts().filter(p => p.id !== id);
            Store.setProducts(products);
            App.showToast('Product deleted');
            renderProductsTable();
            loadDashboardStats();
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('prod-id').value;
        const products = Store.getProducts();
        
        const newProduct = {
            id: id ? id : 'p' + Date.now(),
            name: document.getElementById('prod-name').value,
            price: parseFloat(document.getElementById('prod-price').value),
            category: document.getElementById('prod-category').value,
            image: document.getElementById('prod-image').value,
            stock: parseInt(document.getElementById('prod-stock').value),
            description: document.getElementById('prod-description').value,
            isFeatured: document.getElementById('prod-featured').checked
        };

        if (id) {
            // Update
            const idx = products.findIndex(p => p.id === id);
            products[idx] = newProduct;
            App.showToast('Product updated successfully');
        } else {
            // Add
            products.unshift(newProduct);
            App.showToast('Product added successfully');
        }

        Store.setProducts(products);
        closeProductModal();
        renderProductsTable();
        loadDashboardStats();
    });

    // Init
    loadDashboardStats();
});
