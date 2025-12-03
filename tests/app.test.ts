import net from 'net';
import request from 'supertest';
import { createApp } from '../src/app';
import { generateDiscountCode, resetStore } from '../src/services/commerceService';

const app = createApp();
let canBindToPort = true;

beforeAll(
  () =>
    new Promise<void>((resolve) => {
      const server = net.createServer();
      server.once('error', () => {
        canBindToPort = false;
        resolve();
      });
      server.listen(0, () => {
        server.close();
        resolve();
      });
    }),
);

beforeEach(() => {
  resetStore();
});

const shouldSkip = () => {
  if (!canBindToPort) {
    // eslint-disable-next-line no-console
    console.warn('Skipping HTTP route tests: unable to bind to a port in this environment.');
    return true;
  }
  return false;
};

describe('API routes', () => {
  it('lists products', async () => {
    if (shouldSkip()) return;
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('handles cart add and checkout', async () => {
    if (shouldSkip()) return;
    await request(app)
      .post('/api/cart/alice/items')
      .send({ productId: 'p1', quantity: 1 })
      .expect(201);

    const orderRes = await request(app).post('/api/cart/alice/checkout').send();
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.order.total).toBeGreaterThan(0);
  });

  it('applies discount on eligible order', async () => {
    if (shouldSkip()) return;
    await request(app).post('/api/cart/u1/items').send({ productId: 'p1', quantity: 1 });
    await request(app).post('/api/cart/u1/checkout').send();

    await request(app).post('/api/cart/u2/items').send({ productId: 'p2', quantity: 1 });
    await request(app).post('/api/cart/u2/checkout').send();

    const discount = generateDiscountCode();

    await request(app).post('/api/cart/u3/items').send({ productId: 'p3', quantity: 1 });
    const checkoutRes = await request(app)
      .post('/api/cart/u3/checkout')
      .send({ discountCode: discount.code });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.order.discountAmount).toBeGreaterThan(0);
  });
});
