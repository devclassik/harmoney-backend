import express from 'express';
import { AuthRoutes } from './authRoutes';
import { UserRoutes } from './userRoutes';

export const Routes = express.Router();

Routes.use(AuthRoutes);
Routes.use(UserRoutes);
