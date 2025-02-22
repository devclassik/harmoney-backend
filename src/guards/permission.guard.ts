import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { apiResponse } from '../utils';
import { AppFeatures, User } from '@/database';

export const permissionGuard = (
  feature: AppFeatures,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete',
) => {
  return async (
    req: Request & {
      user: User;
    },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = req.user;
      if (!user || !user.role) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json(apiResponse('error', 'Unauthorized'));
      }

      const permissions = user.role.permissions || [];
      const hasPermission = permissions.some(
        (perm) => perm.feature === feature && perm[action] === true,
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: 'You do not have permission to perform this action',
        });
      }

      next();
    } catch (error) {
      console.error('Permission Guard Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};
