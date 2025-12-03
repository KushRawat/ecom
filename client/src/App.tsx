import { useEffect, useMemo, useState } from 'react';
import './App.css';
import {
  addItem,
  checkoutCart,
  fetchCart,
  fetchMetrics,
  fetchProducts,
  generateDiscount,
} from './api';
import type { Cart, Metrics, Product } from './types';
import { useToast } from './components/ToastProvider';
import { Modal } from './components/Modal';

const USER_ID = 'demo-user';
const DISCOUNT_INTERVAL = Number(import.meta.env.VITE_DISCOUNT_INTERVAL ?? 3);
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    void refreshProducts();
    void refreshCart();
    void refreshMetrics();
  }, []);

  const refreshProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const refreshCart = async () => {
    try {
      const data = await fetchCart(USER_ID);
      setCart(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const refreshMetrics = async () => {
    try {
      const data = await fetchMetrics();
      setMetrics(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const activeDiscount = metrics?.discountCodes.find((code) => code.status === 'active');

  const subtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
  }, [cart, products]);

  const handleAdd = async (productId: string) => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const updated = await addItem(USER_ID, productId, 1);
      setCart(updated);
      addToast('Item added to cart', 'success');
    } catch (err) {
      setError((err as Error).message);
      addToast((err as Error).message, 'error');
    } finally {
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
      const order = await checkoutCart(USER_ID, discountCode || undefined);
      addToast(
        `Order #${order.id} placed for ${currency.format(order.total)}${
          order.discountCode ? ` with code ${order.discountCode}` : ''
        }`,
        'success',
      );
      setDiscountCode('');
      await refreshCart();
      await refreshMetrics();
    } catch (err) {
      setError((err as Error).message);
      addToast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateDiscount = async () => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const discount = await generateDiscount();
      setDiscountCode(discount.code);
      addToast(`New code ${discount.code} ready`, 'success');
      setModalOpen(true);
      await refreshMetrics();
    } catch (err) {
      setError((err as Error).message);
      addToast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <nav className="nav">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <strong>Lightning Cart</strong>
            <p className="muted small">Ecommerce prototype store</p>
          </div>
        </div>
        <div className="nav-actions">
          <span className="pill slim">Free shipping over $100</span>
          <span className="pill outline">Demo user: {USER_ID}</span>
        </div>
      </nav>
      <header className="hero">
        <div>
          <p className="eyebrow">Lightning Cart</p>
          <h1>Prototype commerce store with nth-order discounts.</h1>
          <p className="muted">
            Add items, place orders, and let admins mint a 10% off code every {DISCOUNT_INTERVAL}
            th order.
          </p>
          {activeDiscount ? (
            <div className="pill success">
              Active code <strong>{activeDiscount.code}</strong> reserved for order #
              {activeDiscount.eligibleOrderNumber}
            </div>
          ) : (
            <div className="pill">Next discount unlocks on order #{DISCOUNT_INTERVAL}</div>
          )}
        </div>
          <div className="hero-card">
            <p className="label">Store pulse</p>
            <div className="metrics">
              <div>
                <p className="muted">Items sold</p>
                <strong>{metrics ? metrics.totalItemsPurchased : '—'}</strong>
              </div>
            <div>
              <p className="muted">Discount given</p>
              <strong>
                {metrics ? currency.format(metrics.totalDiscountAmount) : currency.format(0)}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {status && <div className="callout success">{status}</div>}
      {error && <div className="callout error">{error}</div>}

      <main className="layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="label">Catalog</p>
              <h2>Featured items</h2>
            </div>
            <p className="muted">Tap to drop items into your cart.</p>
          </div>
          <div className="products">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-hero" aria-hidden>
                  <span className="product-icon">🛍️</span>
                </div>
                <div>
                  <p className="label">SKU {product.id.toUpperCase()}</p>
                  <h3>{product.name}</h3>
                  <p className="price">{currency.format(product.price)}</p>
                  <p className="muted small">Ships in 2-3 business days</p>
                </div>
                <button disabled={busy} onClick={() => handleAdd(product.id)}>
                  Add to cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="label">Cart</p>
              <h2>Your basket</h2>
            </div>
            <p className="muted">
              Use a discount code if the order is eligible. The code applies to the full order.
            </p>
          </div>

          {cart?.items.length ? (
            <div className="cart-list">
              {cart.items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                const lineTotal = (product?.price ?? 0) * item.quantity;
                return (
                  <div key={item.productId} className="cart-line">
                    <div>
                      <p className="label">{product?.name ?? item.productId}</p>
                      <p className="muted">
                        {item.quantity} × {currency.format(product?.price ?? 0)}
                      </p>
                    </div>
                    <strong>{currency.format(lineTotal)}</strong>
                  </div>
                );
              })}
              <div className="cart-footer">
                <div>
                  <p className="muted">Discount code</p>
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="SAVE-XXXX"
                  />
                </div>
                <div className="totals">
                  <p className="muted">Subtotal</p>
                  <strong>{currency.format(subtotal)}</strong>
                </div>
                <button disabled={busy} className="primary" onClick={handleCheckout}>
                  Checkout
                </button>
              </div>
            </div>
          ) : (
            <div className="empty">Cart is empty — add a product to begin.</div>
          )}
        </section>
      </main>

      <section className="panel admin">
        <div className="panel-heading">
          <div>
            <p className="label">Admin</p>
            <h2>Discount + telemetry</h2>
          </div>
          <button disabled={busy} onClick={handleGenerateDiscount}>
            Generate discount
          </button>
        </div>
        <div className="admin-grid">
          <div className="stat">
            <p className="muted">Items purchased</p>
            <strong>{metrics?.totalItemsPurchased ?? 0}</strong>
          </div>
          <div className="stat">
            <p className="muted">Net purchase</p>
            <strong>
              {currency.format(metrics?.totalPurchaseAmount ?? 0)}{' '}
              <span className="subtle">after discounts</span>
            </strong>
          </div>
          <div className="stat">
            <p className="muted">Total discount given</p>
            <strong>{currency.format(metrics?.totalDiscountAmount ?? 0)}</strong>
          </div>
        </div>

        <div className="codes">
          <p className="label">Codes</p>
          {metrics?.discountCodes.length ? (
            metrics.discountCodes.map((code) => (
              <div key={code.code} className={`code-card ${code.status}`}>
                <div>
                  <p className="muted">Order #{code.eligibleOrderNumber}</p>
                  <strong>{code.code}</strong>
                </div>
                <span className="pill small">{code.status}</span>
              </div>
            ))
          ) : (
            <div className="empty">No codes generated yet.</div>
          )}
        </div>
      </section>

      <Modal open={modalOpen} title="Discount code ready" onClose={() => setModalOpen(false)}>
        <p className="muted">Share this code for the next eligible order.</p>
        <div className="code-modal">
          <strong>{discountCode || activeDiscount?.code || '—'}</strong>
          <button
            onClick={() => {
              if (discountCode || activeDiscount?.code) {
                navigator.clipboard.writeText(discountCode || activeDiscount!.code);
                addToast('Code copied', 'success');
              }
            }}
          >
            Copy
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
