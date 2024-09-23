import express from 'express';
import { WalletController } from '../../controllers';
import { authGuard } from '../../middlewares';

export const WalletRoutes = express.Router();

const walletController = new WalletController();

WalletRoutes.post(
  '/wallet/setup-pin',
  authGuard,
  walletController.setupTrnxPin,
);
WalletRoutes.post(
  '/wallet/change-pin',
  authGuard,
  walletController.changeTrnxPin,
);
WalletRoutes.get(
  '/wallet/transactions',
  authGuard,
  walletController.fetchWalletTransactions,
);
