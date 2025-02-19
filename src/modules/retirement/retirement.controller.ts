import { Request, Response } from 'express';
import { AppDataSource, Employee, Retirement } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';

export class RetirementController {
  private retirementRepo = AppDataSource.getRepository(Retirement);
  private baseService = new BaseService(this.retirementRepo);
  private employeeBaseService = new BaseService(
    AppDataSource.getRepository(Employee),
  );

  public create = async (req: Request, res: Response): Promise<Response> => {
    const { employeeId, reason, recommendedReplacementId } = req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });

      const recommendedReplacement = await this.employeeBaseService.findById({
        id: recommendedReplacementId,
        canBeNull: true,
      });

      await this.baseService.create(
        {
          reason,
          employee,
          recommendedReplacement,
        },
        res,
      );
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const retirementId = Number(req.params.retirementId);
    const { reason, status, recommendedReplacementId } = req.body;

    try {
      const retirement = await this.baseService.findById({
        id: retirementId,
        resource: 'Retirement',
      });
      const recommendedReplacement = await this.employeeBaseService.findById({
        id: recommendedReplacementId,
        canBeNull: true,
      });
      const updatedRetirement = await this.retirementRepo.save({
        ...retirement,
        reason,
        status,
        recommendedReplacement,
      });

      return this.baseService.updatedResponse(res, updatedRetirement);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const retirementId = Number(req.params.retirementId);

    try {
      const retirement = await this.baseService.findById({
        id: retirementId,
        resource: 'Retirement',
        relations: ['employee', 'employee.user', 'recommendedReplacement'],
      });
      const history = await this.retirementRepo.find({
        where: {
          id: Not(retirementId),
          employee: { id: retirement.employee.id },
        },
      });

      return this.baseService.successResponse(res, {
        ...retirement,
        history,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: ['employee', 'employee.user', 'recommendedReplacement'],
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const retirementId = Number(req.params.retirementId);

    try {
      await this.baseService.delete({
        id: retirementId,
        resource: 'Retirement',
        res,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
