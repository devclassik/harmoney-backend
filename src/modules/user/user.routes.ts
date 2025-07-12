import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { getUserByNameSchema } from './user.validator';
import { UserController } from './user.controller';

export const UserRoutes = express.Router();

const userCtrl = new UserController();

// Get users by name
UserRoutes.get(
    '/user/name/:name',
    validateRequest(getUserByNameSchema),
    authGuard,
    userCtrl.getUserByName,
);

export default UserRoutes; 