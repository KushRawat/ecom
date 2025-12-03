export type Product = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Cart = {
  userId: string;
  items: CartItem[];
};

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  discountCode?: string;
  createdAt: Date;
};

export type DiscountCode = {
  code: string;
  percentage: number;
  status: 'active' | 'used' | 'expired';
  createdAt: Date;
  usedAt?: Date;
  usedOnOrder?: number;
  eligibleOrderNumber: number;
};

export type Metrics = {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  totalDiscountAmount: number;
  discountCodes: DiscountCode[];
};
