import express from 'express';
import { OrderController } from '../../controllers';
import { authGuard } from '../../middlewares';

export const OrderRoutes = express.Router();

const orderController = new OrderController();

OrderRoutes.get('/orders', authGuard, orderController.fetchOrders);
