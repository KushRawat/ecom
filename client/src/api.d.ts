import { Cart, Metrics, Order, Product } from './types';
export declare const fetchProducts: () => Promise<Product[]>;
export declare const fetchCart: (userId: string) => Promise<Cart>;
export declare const addItem: (userId: string, productId: string, quantity: number) => Promise<Cart>;
export declare const checkoutCart: (userId: string, discountCode?: string) => Promise<Order>;
export declare const generateDiscount: () => Promise<{
    code: string;
}>;
export declare const fetchMetrics: () => Promise<Metrics>;
//# sourceMappingURL=api.d.ts.map