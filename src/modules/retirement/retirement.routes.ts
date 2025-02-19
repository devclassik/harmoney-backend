import { authGuard } from '@/guards';
import { validateRequest } from '@/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createRetirementSchema,
  updateRetirementSchema,
  getRetirementSchema,
  deleteRetirementSchema,
} from './retirement.validator';
import { RetirementController } from './retirement.controller';

export const RetirementRoutes = express.Router();

const controller = new RetirementController();

RetirementRoutes.post(
  '/retirement',
  validateRequest(createRetirementSchema),
  authGuard,
  controller.create,
);

RetirementRoutes.put(
  '/retirement/:retirementId',
  validateRequest(updateRetirementSchema),
  authGuard,
  controller.update,
);

RetirementRoutes.get(
  '/retirement/:retirementId',
  validateRequest(getRetirementSchema),
  authGuard,
  controller.get,
);

RetirementRoutes.get('/retirement', authGuard, controller.getAll);

RetirementRoutes.delete(
  '/retirement/:retirementId',
  validateRequest(deleteRetirementSchema),
  authGuard,
  controller.delete,
);

export default RetirementRoutes;
