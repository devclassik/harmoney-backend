import { authGuard } from 'src/guards';
import { validateRequest } from 'src/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createPromotionSchema,
  updatePromotionSchema,
  getPromotionSchema,
  deletePromotionSchema,
} from './promotion.validator';
import { PromotionController } from './promotion.controller';

export const PromotionRoutes = express.Router();

const promotionCtrl = new PromotionController();

PromotionRoutes.post(
  '/promotion',
  validateRequest(createPromotionSchema),
  authGuard,
  promotionCtrl.create,
);

PromotionRoutes.put(
  '/promotion/:promotionId',
  validateRequest(updatePromotionSchema),
  authGuard,
  promotionCtrl.update,
);

PromotionRoutes.get(
  '/promotion/:promotionId',
  validateRequest(getPromotionSchema),
  authGuard,
  promotionCtrl.get,
);

PromotionRoutes.get('/promotion', authGuard, promotionCtrl.getAll);

PromotionRoutes.delete(
  '/promotion/:promotionId',
  validateRequest(deletePromotionSchema),
  authGuard,
  promotionCtrl.delete,
);

export default PromotionRoutes;
