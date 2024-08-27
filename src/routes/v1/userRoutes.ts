import express from 'express';
import { UserController } from '../../controllers';
import { authGuard } from '../../middlewares';

export const UserRoutes = express.Router();

const userController = new UserController();

UserRoutes.get('/user', authGuard, userController.getUser);
UserRoutes.delete('/user', authGuard, userController.deleteAccount);
UserRoutes.post('/user/profile', authGuard, userController.updateUser);
UserRoutes.post(
  '/user/change-password',
  authGuard,
  userController.changePassword,
);

UserRoutes.post('/user/setup-pin', authGuard, userController.setupTrnxPin);
UserRoutes.post('/user/change-pin', authGuard, userController.changeTrnxPin);
