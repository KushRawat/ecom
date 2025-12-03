"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMetrics = exports.generateDiscount = exports.checkoutCart = exports.addItem = exports.fetchCart = exports.fetchProducts = void 0;
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const handle = async (res) => {
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = payload.message ?? 'Request failed';
        throw new Error(message);
    }
    return payload;
};
const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/api/products`);
    const data = await handle(res);
    return data.products;
};
exports.fetchProducts = fetchProducts;
const fetchCart = async (userId) => {
    const res = await fetch(`${API_BASE}/api/cart/${userId}`);
    const data = await handle(res);
    return data.cart;
};
exports.fetchCart = fetchCart;
const addItem = async (userId, productId, quantity) => {
    const res = await fetch(`${API_BASE}/api/cart/${userId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
    });
    const data = await handle(res);
    return data.cart;
};
exports.addItem = addItem;
const checkoutCart = async (userId, discountCode) => {
    const res = await fetch(`${API_BASE}/api/cart/${userId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountCode }),
    });
    const data = await handle(res);
    return data.order;
};
exports.checkoutCart = checkoutCart;
const generateDiscount = async () => {
    const res = await fetch(`${API_BASE}/api/admin/discounts`, { method: 'POST' });
    const data = await handle(res);
    return data.discount;
};
exports.generateDiscount = generateDiscount;
const fetchMetrics = async () => {
    const res = await fetch(`${API_BASE}/api/admin/metrics`);
    const data = await handle(res);
    return data.metrics;
};
exports.fetchMetrics = fetchMetrics;
//# sourceMappingURL=api.js.map