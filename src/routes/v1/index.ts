import express from 'express';
import { AuthRoutes } from './authRoutes';
import { UserRoutes } from './userRoutes';
import { WalletRoutes } from './walletRoutes';
import { OrderRoutes } from './orderRoutes';
import { PaymentRoutes } from './paymentRoutes';
import { BusinessRoutes } from './businessRoutes';
import { MarketplaceRoutes } from './marketplaceRoutes';

export const Routes = express.Router();

Routes.use(AuthRoutes);
Routes.use(UserRoutes);
Routes.use(WalletRoutes);
Routes.use(OrderRoutes);
Routes.use(PaymentRoutes);
Routes.use(BusinessRoutes);
Routes.use(MarketplaceRoutes);
