import Joi from 'joi';
import { AppFeatures } from '../../database';

export const updatePermissionSchema = Joi.object({
  canView: Joi.boolean().optional(),
  canCreate: Joi.boolean().optional(),
  canEdit: Joi.boolean().optional(),
  canDelete: Joi.boolean().optional(),
}).min(1);

export const updateRolePermissionSchema = Joi.object({
  roleId: Joi.number().required(),
  permissions: Joi.object()
    .pattern(
      Joi.string().valid(...Object.values(AppFeatures)),
      updatePermissionSchema,
    )
    .required(),
});

export const getPermissionSchema = Joi.object({
  permissionId: Joi.number().required(),
});

export const getPermissionByRoleSchema = Joi.object({
  roleId: Joi.string().optional(),
  role: Joi.string().optional(),
}).xor('roleId', 'role');
