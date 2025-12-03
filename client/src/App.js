"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./App.css");
const api_1 = require("./api");
const USER_ID = 'demo-user';
const DISCOUNT_INTERVAL = Number(import.meta.env.VITE_DISCOUNT_INTERVAL ?? 3);
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
function App() {
    const [products, setProducts] = (0, react_1.useState)([]);
    const [cart, setCart] = (0, react_1.useState)(null);
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [discountCode, setDiscountCode] = (0, react_1.useState)('');
    const [status, setStatus] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [busy, setBusy] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        void refreshProducts();
        void refreshCart();
        void refreshMetrics();
    }, []);
    const refreshProducts = async () => {
        try {
            const data = await (0, api_1.fetchProducts)();
            setProducts(data);
        }
        catch (err) {
            setError(err.message);
        }
    };
    const refreshCart = async () => {
        try {
            const data = await (0, api_1.fetchCart)(USER_ID);
            setCart(data);
        }
        catch (err) {
            setError(err.message);
        }
    };
    const refreshMetrics = async () => {
        try {
            const data = await (0, api_1.fetchMetrics)();
            setMetrics(data);
        }
        catch (err) {
            setError(err.message);
        }
    };
    const activeDiscount = metrics?.discountCodes.find((code) => code.status === 'active');
    const subtotal = (0, react_1.useMemo)(() => {
        if (!cart)
            return 0;
        return cart.items.reduce((sum, item) => {
            const product = products.find((p) => p.id === item.productId);
            return sum + (product?.price ?? 0) * item.quantity;
        }, 0);
    }, [cart, products]);
    const handleAdd = async (productId) => {
        setBusy(true);
        setError(null);
        setStatus(null);
        try {
            const updated = await (0, api_1.addItem)(USER_ID, productId, 1);
            setCart(updated);
            setStatus('Item added to cart');
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setBusy(false);
        }
    };
    const handleCheckout = async () => {
        if (!cart?.items.length) {
            setError('Cart is empty');
            return;
        }
        setBusy(true);
        setError(null);
        setStatus(null);
        try {
            const order = await (0, api_1.checkoutCart)(USER_ID, discountCode || undefined);
            setStatus(`Order #${order.id} placed. Charged ${currency.format(order.total)}${order.discountCode ? ` with code ${order.discountCode}` : ''}`);
            setDiscountCode('');
            await refreshCart();
            await refreshMetrics();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setBusy(false);
        }
    };
    const handleGenerateDiscount = async () => {
        setBusy(true);
        setError(null);
        setStatus(null);
        try {
            const discount = await (0, api_1.generateDiscount)();
            setDiscountCode(discount.code);
            setStatus(`New code ${discount.code} ready for the next eligible order.`);
            await refreshMetrics();
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setBusy(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "page", children: [(0, jsx_runtime_1.jsxs)("header", { className: "hero", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "eyebrow", children: "Lightning Cart" }), (0, jsx_runtime_1.jsx)("h1", { children: "Prototype commerce store with nth-order discounts." }), (0, jsx_runtime_1.jsxs)("p", { className: "muted", children: ["Add items, place orders, and let admins mint a 10% off code every ", DISCOUNT_INTERVAL, "th order."] }), activeDiscount ? ((0, jsx_runtime_1.jsxs)("div", { className: "pill success", children: ["Active code ", (0, jsx_runtime_1.jsx)("strong", { children: activeDiscount.code }), " reserved for order #", activeDiscount.eligibleOrderNumber] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "pill", children: ["Next discount unlocks on order #", DISCOUNT_INTERVAL] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "hero-card", children: [(0, jsx_runtime_1.jsx)("p", { className: "label", children: "Store pulse" }), (0, jsx_runtime_1.jsxs)("div", { className: "metrics", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Items sold" }), (0, jsx_runtime_1.jsx)("strong", { children: metrics ? metrics.totalItemsPurchased : '—' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Discount given" }), (0, jsx_runtime_1.jsx)("strong", { children: metrics ? currency.format(metrics.totalDiscountAmount) : currency.format(0) })] })] })] })] }), status && (0, jsx_runtime_1.jsx)("div", { className: "callout success", children: status }), error && (0, jsx_runtime_1.jsx)("div", { className: "callout error", children: error }), (0, jsx_runtime_1.jsxs)("main", { className: "layout", children: [(0, jsx_runtime_1.jsxs)("section", { className: "panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "label", children: "Catalog" }), (0, jsx_runtime_1.jsx)("h2", { children: "Featured items" })] }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Tap to drop items into your cart." })] }), (0, jsx_runtime_1.jsx)("div", { className: "products", children: products.map((product) => ((0, jsx_runtime_1.jsxs)("article", { className: "product-card", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "label", children: ["SKU ", product.id.toUpperCase()] }), (0, jsx_runtime_1.jsx)("h3", { children: product.name }), (0, jsx_runtime_1.jsx)("p", { className: "price", children: currency.format(product.price) })] }), (0, jsx_runtime_1.jsx)("button", { disabled: busy, onClick: () => handleAdd(product.id), children: "Add to cart" })] }, product.id))) })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "label", children: "Cart" }), (0, jsx_runtime_1.jsx)("h2", { children: "Your basket" })] }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Use a discount code if the order is eligible. The code applies to the full order." })] }), cart?.items.length ? ((0, jsx_runtime_1.jsxs)("div", { className: "cart-list", children: [cart.items.map((item) => {
                                        const product = products.find((p) => p.id === item.productId);
                                        const lineTotal = (product?.price ?? 0) * item.quantity;
                                        return ((0, jsx_runtime_1.jsxs)("div", { className: "cart-line", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "label", children: product?.name ?? item.productId }), (0, jsx_runtime_1.jsxs)("p", { className: "muted", children: [item.quantity, " \u00D7 ", currency.format(product?.price ?? 0)] })] }), (0, jsx_runtime_1.jsx)("strong", { children: currency.format(lineTotal) })] }, item.productId));
                                    }), (0, jsx_runtime_1.jsxs)("div", { className: "cart-footer", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Discount code" }), (0, jsx_runtime_1.jsx)("input", { value: discountCode, onChange: (e) => setDiscountCode(e.target.value), placeholder: "SAVE-XXXX" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "totals", children: [(0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Subtotal" }), (0, jsx_runtime_1.jsx)("strong", { children: currency.format(subtotal) })] }), (0, jsx_runtime_1.jsx)("button", { disabled: busy, className: "primary", onClick: handleCheckout, children: "Checkout" })] })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "empty", children: "Cart is empty \u2014 add a product to begin." }))] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel admin", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "label", children: "Admin" }), (0, jsx_runtime_1.jsx)("h2", { children: "Discount + telemetry" })] }), (0, jsx_runtime_1.jsx)("button", { disabled: busy, onClick: handleGenerateDiscount, children: "Generate discount" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "admin-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Items purchased" }), (0, jsx_runtime_1.jsx)("strong", { children: metrics?.totalItemsPurchased ?? 0 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Net purchase" }), (0, jsx_runtime_1.jsxs)("strong", { children: [currency.format(metrics?.totalPurchaseAmount ?? 0), ' ', (0, jsx_runtime_1.jsx)("span", { className: "subtle", children: "after discounts" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "stat", children: [(0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Total discount given" }), (0, jsx_runtime_1.jsx)("strong", { children: currency.format(metrics?.totalDiscountAmount ?? 0) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "codes", children: [(0, jsx_runtime_1.jsx)("p", { className: "label", children: "Codes" }), metrics?.discountCodes.length ? (metrics.discountCodes.map((code) => ((0, jsx_runtime_1.jsxs)("div", { className: `code-card ${code.status}`, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "muted", children: ["Order #", code.eligibleOrderNumber] }), (0, jsx_runtime_1.jsx)("strong", { children: code.code })] }), (0, jsx_runtime_1.jsx)("span", { className: "pill small", children: code.status })] }, code.code)))) : ((0, jsx_runtime_1.jsx)("div", { className: "empty", children: "No codes generated yet." }))] })] })] }));
}
exports.default = App;
//# sourceMappingURL=App.js.map