import type { Cart, Metrics, Order, Product } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const handle = async <T>(res: Response): Promise<T> => {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (payload as { message?: string }).message ?? 'Request failed';
    throw new Error(message);
  }
  return payload as T;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API_BASE}/api/products`);
  const data = await handle<{ products: Product[] }>(res);
  return data.products;
};

export const fetchCart = async (userId: string): Promise<Cart> => {
  const res = await fetch(`${API_BASE}/api/cart/${userId}`);
  const data = await handle<{ cart: Cart }>(res);
  return data.cart;
};

export const addItem = async (
  userId: string,
  productId: string,
  quantity: number,
): Promise<Cart> => {
  const res = await fetch(`${API_BASE}/api/cart/${userId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  const data = await handle<{ cart: Cart }>(res);
  return data.cart;
};

export const checkoutCart = async (userId: string, discountCode?: string): Promise<Order> => {
  const res = await fetch(`${API_BASE}/api/cart/${userId}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ discountCode }),
  });
  const data = await handle<{ order: Order }>(res);
  return data.order;
};

export const generateDiscount = async () => {
  const res = await fetch(`${API_BASE}/api/admin/discounts`, { method: 'POST' });
  const data = await handle<{ discount: { code: string } }>(res);
  return data.discount;
};

export const fetchMetrics = async (): Promise<Metrics> => {
  const res = await fetch(`${API_BASE}/api/admin/metrics`);
  const data = await handle<{ metrics: Metrics }>(res);
  return data.metrics;
};
