import express from 'express';
import { AuthRoutes } from './authRoutes';

export const Routes = express.Router();

Routes.use(AuthRoutes);
