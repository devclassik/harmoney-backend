import express from 'express';
import { UserController } from '../../controllers';
import { authGuard } from '../../middlewares';

export const UserRoutes = express.Router();

const userController = new UserController();

UserRoutes.get('/user', authGuard, userController.getUser);
UserRoutes.delete('/user', authGuard, userController.deleteAccount);
UserRoutes.patch('/user/profile', authGuard, userController.updateUser);
UserRoutes.patch(
  '/user/notification-setting',
  authGuard,
  userController.uploadNotificationSetting,
);

UserRoutes.put(
  '/user/profile/photo',
  authGuard,
  userController.uploadProfilePhoto,
);
UserRoutes.post(
  '/user/change-password',
  authGuard,
  userController.changePassword,
);

UserRoutes.post(
  '/user/verifyIdentity/initiate',
  authGuard,
  userController.initiateIdentityVerification,
);

UserRoutes.patch(
  '/user/business/profile',
  authGuard,
  userController.uploadBusinessProfile,
);
UserRoutes.put(
  '/user/business/bank',
  authGuard,
  userController.uploadBusinessBank,
);
