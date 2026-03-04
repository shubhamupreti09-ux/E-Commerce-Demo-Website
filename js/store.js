/**
 * Core Store Management utilizing LocalStorage
 * Manages Inventories, Users, Cart, and Orders.
 */

const Store = {
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // 1. PRODUCTS
  getProducts() {
    return this.get("ecommerce_products") || [];
  },

  setProducts(products) {
    this.set("ecommerce_products", products);
  },

  getProduct(id) {
    return this.getProducts().find((p) => p.id === id);
  },

  updateProductStock(id, quantityPurchased) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index].stock -= quantityPurchased;
      if (products[index].stock < 0) products[index].stock = 0;
      this.setProducts(products);
    }
  },

  // 2. CART
  getCart() {
    return this.get("ecommerce_cart") || [];
  },

  setCart(cart) {
    this.set("ecommerce_cart", cart);
  },

  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      // Check stock
      const dbProduct = this.getProduct(product.id);
      if (existing.quantity + quantity > dbProduct.stock) {
        return { success: false, message: "Not enough stock available" };
      }
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    this.setCart(cart);
    return { success: true };
  },

  removeFromCart(id) {
    const cart = this.getCart().filter((item) => item.id !== id);
    this.setCart(cart);
  },

  updateCartQuantity(id, quantity) {
    const cart = this.getCart();
    const item = cart.find((i) => i.id === id);
    if (item) {
      item.quantity = quantity;
      this.setCart(cart);
    }
  },

  clearCart() {
    this.setCart([]);
  },

  // 3. ORDERS
  getOrders() {
    return this.get("ecommerce_orders") || [];
  },

  addOrder(order) {
    const orders = this.getOrders();
    orders.push({
      id: "ORD-" + Math.floor(Math.random() * 1000000),
      date: new Date().toISOString(),
      ...order,
    });
    this.set("ecommerce_orders", orders);
  },

  // 4. USERS
  getUser() {
    return this.get("ecommerce_user") || null;
  },

  setUser(user) {
    this.set("ecommerce_user", user);
  },
};

window.Store = Store;
