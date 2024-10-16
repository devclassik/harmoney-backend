import express from 'express';
import { PaymentController } from '../../controllers';
import { authGuard } from '../../guards';

export const PaymentRoutes = express.Router();

const paymentController = new PaymentController();

PaymentRoutes.get('/payment/banks', authGuard, paymentController.fetchBankList);

PaymentRoutes.post(
  '/payment/account-details',
  authGuard,
  paymentController.fetchAccountDetails,
);

PaymentRoutes.post('/payment/webhook', paymentController.webhook);

PaymentRoutes.get('/payment/users', authGuard, paymentController.getContacts);
