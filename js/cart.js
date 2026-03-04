/**
 * Cart and Checkout Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('cart-container');
    const checkoutModal = document.getElementById('checkout-modal');
    const successModal = document.getElementById('success-modal');
    const closeCheckout = document.getElementById('close-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    
    let discountApplied = false;
    let finalTotal = 0;

    function renderCart() {
        const cart = Store.getCart();
        
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i class="ph ph-shopping-cart" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 20px;"></i>
                    <h2>Your cart is empty</h2>
                    <p style="color:var(--text-muted); margin: 16px 0 24px;">Looks like you haven't added anything to your cart yet.</p>
                    <a href="shop.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            App.updateCartBadge();
            return;
        }

        let subtotal = 0;
        let itemsHtml = '<div class="cart-items">';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            itemsHtml += `
                <div class="cart-item card">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${Number(item.price).toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                            <input type="text" class="qty-input" value="${item.quantity}" readonly>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeItem('${item.id}')" aria-label="Remove item">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        itemsHtml += '</div>';

        const discountAmount = discountApplied ? subtotal * 0.4 : 0; // 40% demo discount
        finalTotal = subtotal + 15 - discountAmount; // $15 flat shipping for demo

        const summaryHtml = `
            <div class="order-summary card">
                <h3>Order Summary</h3>
                <div style="margin-top: 24px;">
                    <div class="summary-row">
                        <span>Subtotal (${cart.length} items)</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>$15.00</span>
                    </div>
                    ${discountApplied ? `
                    <div class="summary-row text-gradient">
                        <span>Discount (SUMMER40)</span>
                        <span>-$${discountAmount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div class="summary-total">
                        <span>Total</span>
                        <span class="text-gradient">$${finalTotal.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="discount-code">
                    <input type="text" id="promo-code" class="input-control" placeholder="Promo Code" ${discountApplied ? 'disabled value="SUMMER40"' : ''}>
                    <button class="btn btn-secondary" onclick="applyPromo()">Apply</button>
                </div>

                <button class="btn btn-primary" style="width: 100%; margin-top: 24px;" onclick="openCheckout()">Proceed to Checkout</button>
                <div style="text-align:center; display:flex; gap: 8px; justify-content:center; align-items:center; color: var(--text-muted); font-size: 0.9rem; margin-top: 16px;">
                    <i class="ph ph-lock-key"></i> Secure SSL Encrypted
                </div>
            </div>
        `;

        container.innerHTML = itemsHtml + summaryHtml;
        App.updateCartBadge();
    }

    // Expose to window for inline onclick execution
    window.updateQty = (id, change) => {
        const cart = Store.getCart();
        const item = cart.find(i => i.id === id);
        if (item) {
            const product = Store.getProduct(id);
            const newQty = item.quantity + change;
            
            if (newQty < 1) {
                // Ignore, or ask to remove
            } else if (newQty > product.stock) {
                App.showToast('Not enough stock available', 'error');
            } else {
                Store.updateCartQuantity(id, newQty);
                renderCart();
            }
        }
    };

    window.removeItem = (id) => {
        Store.removeFromCart(id);
        renderCart();
        App.showToast('Item removed from cart');
    };

    window.applyPromo = () => {
        const input = document.getElementById('promo-code');
        if (input.value.toUpperCase() === 'SUMMER40') {
            discountApplied = true;
            renderCart();
            App.showToast('Promo code applied successfully!', 'success');
        } else {
            App.showToast('Invalid promo code', 'error');
        }
    };

    window.openCheckout = () => {
        document.getElementById('checkout-total-val').textContent = '$' + finalTotal.toFixed(2);
        checkoutModal.classList.remove('hidden');
    };

    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
    });

    // Mock Checkout Processing
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Disable button visually
        const btn = checkoutForm.querySelector('button[type="submit"]');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing Securely...';
        btn.disabled = true;

        setTimeout(() => {
            // "Charge" successful
            
            // 1. Update product stocks
            const cart = Store.getCart();
            cart.forEach(item => {
                Store.updateProductStock(item.id, item.quantity);
            });

            // 2. Add Order to history
            const userEmail = checkoutForm.querySelector('input[type="email"]').value;
            Store.addOrder({
                user: userEmail,
                items: cart,
                total: finalTotal,
                status: 'Processing'
            });

            // 3. Clear Cart
            Store.clearCart();

            // 4. Show success modal invoice
            const orderIdStr = Store.getOrders()[Store.getOrders().length -1].id;
            document.getElementById('success-order-id').textContent = orderIdStr;
            document.getElementById('success-amount').textContent = '$' + finalTotal.toFixed(2);
            
            checkoutModal.classList.add('hidden');
            successModal.classList.remove('hidden');
            
            App.updateCartBadge();
            App.showToast('Invoice sent to ' + userEmail, 'success');

        }, 2000); // Fake delay for SSL / Server response visual
    });

    renderCart();
});
