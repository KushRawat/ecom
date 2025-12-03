import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import {
  addItemToCart,
  checkout,
  generateDiscountCode,
  getCart,
  getMetrics,
  listProducts,
} from './services/commerceService';
import { AppError } from './utils/errors';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/products', (_req, res) => {
    res.json({ products: listProducts() });
  });

  app.get('/api/cart/:userId', (req, res) => {
    const cart = getCart(req.params.userId);
    res.json({ cart });
  });

  app.post('/api/cart/:userId/items', (req, res, next) => {
    try {
      const { productId, quantity } = req.body;
      const cart = addItemToCart(req.params.userId, productId, Number(quantity));
      res.status(201).json({ cart });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/cart/:userId/checkout', (req, res, next) => {
    try {
      const { discountCode } = req.body;
      const order = checkout(req.params.userId, discountCode);
      res.status(201).json({ order });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/discounts', (_req, res, next) => {
    try {
      const discount = generateDiscountCode();
      res.status(201).json({ discount });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/admin/metrics', (_req, res) => {
    const metrics = getMetrics();
    res.json({ metrics });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const error = err as AppError;
    const status = error.status ?? 500;
    res.status(status).json({ message: error.message ?? 'Unexpected error' });
  });

  return app;
};
