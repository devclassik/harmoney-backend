import express from 'express';
import { AuthRoutes } from './authRoutes';
import { UserRoutes } from './userRoutes';
import { WalletRoutes } from './walletRoutes';

export const Routes = express.Router();

Routes.use(AuthRoutes);
Routes.use(UserRoutes);
Routes.use(WalletRoutes);
