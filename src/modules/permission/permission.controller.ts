import {
  AppDataSource,
  AppFeatures,
  Permission,
  Role,
  UserRoles,
} from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';
import {
  GetPermissionsDto,
  UpdatePermissionDto,
  UpdateRolePermissionsDto,
} from './permission.dto';

export class PermissionController {
  private permissionRepo = AppDataSource.getRepository(Permission);
  private baseService = new BaseService(
    AppDataSource.getRepository(Permission),
  );
  private baseRoleService = new BaseService(AppDataSource.getRepository(Role));

  public update = async (
    req: Request<GetPermissionsDto, null, UpdatePermissionDto, null>,
    res: Response,
  ): Promise<Response> => {
    try {
      const { permissionId } = req.params;
      const { canView, canCreate, canEdit, canDelete } = req.body;

      const permission = await this.baseService.findById({
        id: permissionId,
        resource: 'Permission',
      });

      permission.canView = canView ?? permission.canView;
      permission.canCreate = canCreate ?? permission.canCreate;
      permission.canEdit = canEdit ?? permission.canEdit;
      permission.canDelete = canDelete ?? permission.canDelete;

      await this.permissionRepo.save(permission);

      return this.baseService.updatedResponse(res, permission);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public updateRolePermissions = async (
    req: Request<null, null, UpdateRolePermissionsDto, null>,
    res: Response,
  ): Promise<Response> => {
    try {
      const { roleId, permissions } = req.body;

      const role = await this.baseRoleService.findById({
        id: roleId,
        resource: 'Role',
        relations: ['permissions'],
      });

      const existingPermissions = role.permissions;

      const newPermissions: Permission[] = [];
      for (const [feature, perms] of Object.entries(permissions)) {
        let permission = existingPermissions.find((p) => p.feature === feature);

        permission.canView = perms.canView ?? permission.canView;
        permission.canCreate = perms.canCreate ?? permission.canCreate;
        permission.canEdit = perms.canEdit ?? permission.canEdit;
        permission.canDelete = perms.canDelete ?? permission.canDelete;

        newPermissions.push(permission);
      }

      await this.permissionRepo.save(newPermissions);

      return this.baseService.updatedResponse(res, newPermissions);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const permissionId = Number(req.params.permissionId);

    try {
      const permission = await this.baseService.findById({
        id: permissionId,
        resource: 'Permission',
        relations: ['role', 'role.users', 'role.users.employee'],
      });

      return this.baseService.updatedResponse(res, permission);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getByRoleIdOrName = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { roleId, role: roleName } = req.query;

    try {
      const permission = await this.permissionRepo.find({
        where: [
          ...(roleId ? [{ role: { id: Number(roleId) } }] : []),
          ...(roleName ? [{ role: { name: roleName as UserRoles } }] : []),
        ],
        relations: ['role'],
      });

      if (!permission?.length) {
        return this.baseService.notFoundResponse(res, 'Role');
      }

      return this.baseService.updatedResponse(res, permission);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: ['role'],
      });
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
    }
  };
}
