import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { MessageController } from './message.controller';
import { markAsReadSchema } from './message.validator';

export const MessageRoutes = express.Router();

const controller = new MessageController();

MessageRoutes.get('/message/:messageId', authGuard, controller.get);

MessageRoutes.get('/message', authGuard, controller.getAll);

MessageRoutes.put(
  '/message/mark-read',
  authGuard,
  validateRequest(markAsReadSchema),
  controller.markAsRead,
);

MessageRoutes.get('/message', authGuard, controller.getAll);
MessageRoutes.post('/message', authGuard, controller.create);

export default MessageRoutes;
