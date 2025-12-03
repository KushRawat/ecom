import { DISCOUNT_INTERVAL, DISCOUNT_PERCENT } from '../config/constants';
import {
  Cart,
  CartItem,
  DiscountCode,
  Metrics,
  Order,
  OrderItem,
  Product,
} from '../types';
import { AppError } from '../utils/errors';

const products: Product[] = [
  { id: 'p1', name: 'Laptop', price: 1200 },
  { id: 'p2', name: 'Headphones', price: 150 },
  { id: 'p3', name: 'Keyboard', price: 90 },
];

const carts = new Map<string, CartItem[]>();
let orders: Order[] = [];
let discountCodes: DiscountCode[] = [];

const calculateCartSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return sum;
    }
    return sum + product.price * item.quantity;
  }, 0);

const mapOrderItems = (items: CartItem[]): OrderItem[] =>
  items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new AppError('Product not found in catalog', 404);
    }
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    };
  });

const getActiveDiscount = (): DiscountCode | undefined =>
  discountCodes.find((code) => code.status === 'active');

const expireObsoleteDiscounts = (currentOrderNumber: number) => {
  const activeDiscount = getActiveDiscount();
  if (activeDiscount && activeDiscount.eligibleOrderNumber < currentOrderNumber) {
    activeDiscount.status = 'expired';
    activeDiscount.usedAt = new Date();
  }
};

export const listProducts = (): Product[] => products;

export const getCart = (userId: string): Cart => ({
  userId,
  items: carts.get(userId) ?? [],
});

export const addItemToCart = (
  userId: string,
  productId: string,
  quantity: number,
): Cart => {
  if (Number.isNaN(quantity) || quantity <= 0) {
    throw new AppError('Quantity must be greater than zero');
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const currentItems = carts.get(userId) ?? [];
  const existing = currentItems.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    currentItems.push({ productId, quantity });
  }

  carts.set(userId, currentItems);
  return getCart(userId);
};

export const generateDiscountCode = (): DiscountCode => {
  const nextOrderNumber = orders.length + 1;
  expireObsoleteDiscounts(nextOrderNumber);

  if (nextOrderNumber % DISCOUNT_INTERVAL !== 0) {
    throw new AppError(
      `Next order (#${nextOrderNumber}) is not eligible for a discount. Interval is every ${DISCOUNT_INTERVAL} orders.`,
    );
  }

  if (getActiveDiscount()) {
    throw new AppError('An active discount code already exists');
  }

  const code = `SAVE-${nextOrderNumber}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const discount: DiscountCode = {
    code,
    percentage: DISCOUNT_PERCENT,
    status: 'active',
    createdAt: new Date(),
    eligibleOrderNumber: nextOrderNumber,
  };
  discountCodes.push(discount);
  return discount;
};

export const checkout = (userId: string, discountCode?: string): Order => {
  const cart = getCart(userId);
  if (!cart.items.length) {
    throw new AppError('Cart is empty', 400);
  }

  const subtotal = calculateCartSubtotal(cart.items);
  const orderNumber = orders.length + 1;
  expireObsoleteDiscounts(orderNumber);

  let discountAmount = 0;
  const activeDiscount = getActiveDiscount();
  if (discountCode) {
    if (!activeDiscount || activeDiscount.code !== discountCode) {
      throw new AppError('Invalid or expired discount code', 400);
    }

    if (orderNumber !== activeDiscount.eligibleOrderNumber) {
      throw new AppError(
        `Discount code only applies to order #${activeDiscount.eligibleOrderNumber}`,
        400,
      );
    }

    discountAmount = subtotal * activeDiscount.percentage;
    activeDiscount.status = 'used';
    activeDiscount.usedAt = new Date();
    activeDiscount.usedOnOrder = orderNumber;
  }

  const total = subtotal - discountAmount;
  const order: Order = {
    id: orderNumber,
    userId,
    items: mapOrderItems(cart.items),
    subtotal,
    discountAmount,
    total,
    createdAt: new Date(),
    ...(discountAmount > 0 && discountCode ? { discountCode } : {}),
  };

  orders = [...orders, order];
  carts.delete(userId);

  return order;
};

export const getMetrics = (): Metrics => {
  const totalItemsPurchased = orders.reduce(
    (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
    0,
  );
  const totalPurchaseAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const totalDiscountAmount = orders.reduce((sum, order) => sum + order.discountAmount, 0);

  return {
    totalItemsPurchased,
    totalPurchaseAmount,
    totalDiscountAmount,
    discountCodes,
  };
};

export const resetStore = () => {
  carts.clear();
  orders = [];
  discountCodes = [];
};
