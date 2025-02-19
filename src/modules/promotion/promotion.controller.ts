import { Request, Response } from 'express';
import { AppDataSource, Employee, Promotion } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';

export class PromotionController {
  private promotionRepo = AppDataSource.getRepository(Promotion);
  private baseService = new BaseService(this.promotionRepo);
  private employeeBaseService = new BaseService(
    AppDataSource.getRepository(Employee),
  );

  public create = async (req: Request, res: Response): Promise<Response> => {
    const { employeeId, newPosition } = req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });
      await this.baseService.create(
        {
          newPosition,
          employee,
        },
        res,
      );
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const promotionId = Number(req.params.promotionId);
    const { newPosition, status } = req.body;

    try {
      const promotion = await this.baseService.findById({
        id: promotionId,
        resource: 'Promotion',
      });

      const updatedPromotion = await this.promotionRepo.save({
        ...promotion,
        newPosition,
        status,
      });

      return this.baseService.updatedResponse(res, updatedPromotion);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const promotionId = Number(req.params.promotionId);

    try {
      const promotion = await this.baseService.findById({
        id: promotionId,
        resource: 'Promotion',
        relations: ['employee', 'employee.user'],
      });
      const history = await this.promotionRepo.find({
        where: {
          id: Not(promotionId),
          employee: { id: promotion.employee.id },
        },
      });

      return this.baseService.successResponse(res, { ...promotion, history });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: ['employee', 'employee.user'],
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const promotionId = Number(req.params.promotionId);

    try {
      await this.baseService.delete({
        id: promotionId,
        resource: 'Promotion',
        res,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
