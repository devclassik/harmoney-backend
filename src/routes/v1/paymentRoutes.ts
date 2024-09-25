import express from 'express';
import { PaymentController } from '../../controllers';
import { authGuard } from '../../middlewares';

export const PaymentRoutes = express.Router();

const paymentController = new PaymentController();

PaymentRoutes.get('/payment/banks', authGuard, paymentController.fetchBankList);
