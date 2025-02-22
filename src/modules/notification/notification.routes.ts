import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { NotificationController } from './notification.controller';
import { markAsReadSchema } from './notification.validator';

export const NotificationRoutes = express.Router();

const controller = new NotificationController();

NotificationRoutes.get(
  '/notification/:notificationId',
  authGuard,
  controller.get,
);

NotificationRoutes.get('/notification', authGuard, controller.getAll);

NotificationRoutes.put(
  '/notification/mark-read',
  authGuard,
  validateRequest(markAsReadSchema),
  controller.markAsRead,
);

NotificationRoutes.get('/notification', authGuard, controller.getAll);
NotificationRoutes.post('/notification', authGuard, controller.create);

export default NotificationRoutes;
