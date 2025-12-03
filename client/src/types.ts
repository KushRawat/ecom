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

export type Order = {
  id: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  discountCode?: string;
};

export type DiscountCode = {
  code: string;
  status: 'active' | 'used' | 'expired';
  eligibleOrderNumber: number;
};

export type Metrics = {
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  totalDiscountAmount: number;
  discountCodes: DiscountCode[];
};
