import { AppFeatures } from '../../database';

export interface UpdatePermissionDto {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface UpdateRolePermissionsDto {
  roleId: number;
  permissions: Record<AppFeatures, UpdatePermissionDto>;
}

export interface GetPermissionsDto {
  permissionId: number;
}
