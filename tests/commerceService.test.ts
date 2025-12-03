import {
  addItemToCart,
  checkout,
  generateDiscountCode,
  getCart,
  getMetrics,
  resetStore,
} from '../src/services/commerceService';
import { DISCOUNT_PERCENT } from '../src/config/constants';

beforeEach(() => {
  resetStore();
});

const prepareOrder = (userId: string) => {
  addItemToCart(userId, 'p1', 1);
  return checkout(userId);
};

describe('commerceService', () => {
  it('adds items to cart and checks out without discount', () => {
    addItemToCart('alice', 'p1', 1);
    addItemToCart('alice', 'p2', 2);

    const cart = getCart('alice');
    expect(cart.items).toHaveLength(2);

    const order = checkout('alice');
    expect(order.total).toBeGreaterThan(0);
    expect(order.discountAmount).toBe(0);

    const metrics = getMetrics();
    expect(metrics.totalItemsPurchased).toBe(3);
    expect(metrics.totalDiscountAmount).toBe(0);
  });

  it('rejects generating discount before interval', () => {
    expect(() => generateDiscountCode()).toThrow(/not eligible/);
  });

  it('applies discount code on nth order', () => {
    prepareOrder('user1');
    prepareOrder('user2');

    const discount = generateDiscountCode();
    expect(discount.status).toBe('active');

    addItemToCart('user3', 'p2', 2);
    const order = checkout('user3', discount.code);

    const expectedSubtotal = 150 * 2;
    expect(order.subtotal).toBe(expectedSubtotal);
    expect(order.discountAmount).toBeCloseTo(expectedSubtotal * DISCOUNT_PERCENT);
    expect(order.total).toBeCloseTo(expectedSubtotal * (1 - DISCOUNT_PERCENT));

    const metrics = getMetrics();
    expect(metrics.totalItemsPurchased).toBe(4);
    expect(metrics.totalDiscountAmount).toBeGreaterThan(0);
    expect(metrics.discountCodes[0].status).toBe('used');
  });
});
