import { AppDataSource, Organization } from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';

export class OrganizationController {
  private orgRepo = AppDataSource.getRepository(Organization);
  private baseService = new BaseService(
    AppDataSource.getRepository(Organization),
  );

  public create = async (req: Request, res: Response): Promise<Response> => {
    const { name } = req.body;

    try {
      await this.baseService.isPropertyTaken('name', name, 'Organization name');
      const org = await this.baseService.create({ name });
      return await this.baseService.createdResponse(res, org);
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const organizationId = Number(req.params.organizationId);
    const { name } = req.body;

    await this.baseService.isPropertyTaken('name', name, 'Organization name');

    try {
      const organization = await this.baseService.findById({
        id: organizationId,
        resource: 'Organization',
      });

      const data = await this.orgRepo.save({ ...organization, name });

      return this.baseService.updatedResponse(res, data);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const organizationId = Number(req.params.organizationId);

    try {
      const organization = await this.baseService.findById({
        id: organizationId,
        resource: 'Organization',
        relations: [
          'departments',
          'departments.members',
          'headDepartment',
          'headDepartment.hod',
          'headDepartment.members',
        ],
      });

      return this.baseService.updatedResponse(res, organization);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: [
          'departments',
          'departments.members',
          'headDepartment',
          'headDepartment.hod',
          'headDepartment.members',
        ],
      });
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const organizationId = Number(req.params.organizationId);

    try {
      await this.baseService.delete({
        id: organizationId,
        resource: 'Organization',
      });
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };
}
