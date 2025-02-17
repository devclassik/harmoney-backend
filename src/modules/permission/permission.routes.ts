import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { PermissionController } from './permission.controller';
import {
  getPermissionByRoleSchema,
  getPermissionSchema,
  updatePermissionSchema,
  updateRolePermissionSchema,
} from './permission.validator';

export const PermissionRoute = express.Router();

const permissionCtrl = new PermissionController();

PermissionRoute.get(
  '/permission/get-by-role',
  validateRequest(getPermissionByRoleSchema),
  authGuard,
  permissionCtrl.getByRoleIdOrName,
);

PermissionRoute.put(
  '/permission/update-role-permissions',
  validateRequest(updateRolePermissionSchema),
  authGuard,
  permissionCtrl.updateRolePermissions,
);

PermissionRoute.put(
  '/permission/:permissionId',
  validateRequest(updatePermissionSchema),
  authGuard,
  permissionCtrl.update,
);

PermissionRoute.get(
  '/permission/:permissionId',
  validateRequest(getPermissionSchema),
  authGuard,
  permissionCtrl.get,
);

PermissionRoute.get('/permission', authGuard, permissionCtrl.getAll);

export default PermissionRoute;
