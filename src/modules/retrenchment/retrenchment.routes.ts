import { authGuard } from 'src/guards';
import { validateRequest } from 'src/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createRetrenchmentSchema,
  updateRetrenchmentSchema,
  getRetrenchmentSchema,
  deleteRetrenchmentSchema,
} from './retrenchment.validator';
import { RetrenchmentController } from './retrenchment.controller';

export const RetrenchmentRoutes = express.Router();

const controller = new RetrenchmentController();

RetrenchmentRoutes.post(
  '/retrenchment',
  validateRequest(createRetrenchmentSchema),
  authGuard,
  controller.create,
);

RetrenchmentRoutes.put(
  '/retrenchment/:retrenchmentId',
  validateRequest(updateRetrenchmentSchema),
  authGuard,
  controller.update,
);

RetrenchmentRoutes.get(
  '/retrenchment/:retrenchmentId',
  validateRequest(getRetrenchmentSchema),
  authGuard,
  controller.get,
);

RetrenchmentRoutes.get('/retrenchment', authGuard, controller.getAll);

RetrenchmentRoutes.delete(
  '/retrenchment/:retrenchmentId',
  validateRequest(deleteRetrenchmentSchema),
  authGuard,
  controller.delete,
);

export default RetrenchmentRoutes;
