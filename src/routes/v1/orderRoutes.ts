import express from 'express';
import { OrderController } from '../../controllers';
import { authGuard, businessGuard } from '../../guards';

export const OrderRoutes = express.Router();

const orderController = new OrderController();

OrderRoutes.get(
  '/orders',
  authGuard,
  businessGuard,
  orderController.fetchOrders,
);

OrderRoutes.patch(
  '/order',
  authGuard,
  businessGuard,
  orderController.updateOrderStatus,
);
