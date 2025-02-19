import { authGuard } from '@/guards';
import { validateRequest } from '@/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createTransferSchema,
  updateTransferSchema,
  getTransferSchema,
  deleteTransferSchema,
} from './transfer.validator';
import { TransferController } from './transfer.controller';

export const TransferRoutes = express.Router();

const controller = new TransferController();

TransferRoutes.post(
  '/transfer',
  validateRequest(createTransferSchema),
  authGuard,
  controller.create,
);

TransferRoutes.put(
  '/transfer/:transferId',
  validateRequest(updateTransferSchema),
  authGuard,
  controller.update,
);

TransferRoutes.get(
  '/transfer/:transferId',
  validateRequest(getTransferSchema),
  authGuard,
  controller.get,
);

TransferRoutes.get('/transfer', authGuard, controller.getAll);

TransferRoutes.delete(
  '/transfer/:transferId',
  validateRequest(deleteTransferSchema),
  authGuard,
  controller.delete,
);

export default TransferRoutes;
