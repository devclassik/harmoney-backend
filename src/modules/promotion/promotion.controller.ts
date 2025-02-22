import { Request, Response } from 'express';
import { AppDataSource, AppFeatures, Employee, Promotion } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';
import { MessageService } from '../message/message.service';

export class PromotionController {
  private promotionRepo = AppDataSource.getRepository(Promotion);
  private baseService = new BaseService(this.promotionRepo);
  private employeeBaseService = new BaseService(
    AppDataSource.getRepository(Employee),
  );

  public create = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const { employeeId, newPosition, status } = req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });
      const promotion = await this.baseService.create({
        newPosition,
        employee,
      });

      await MessageService.send({
        title: `Promotion ${status || 'Request'}`,
        feature: AppFeatures.PROMOTION,
        message: 'Promotion request submitted',
        metadata: {},
        actionBy: req.employee.id,
        actionFor: employeeId,
        actionTo: [employeeId],
        documents: ['request url'],
      });

      return this.baseService.createdResponse(res, promotion);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const promotionId = Number(req.params.promotionId);
    const { newPosition, status } = req.body;

    try {
      const promotion = await this.baseService.findById({
        id: promotionId,
        resource: 'Promotion',
        relations: ['employee'],
      });

      const updatedPromotion = await this.promotionRepo.save({
        ...promotion,
        newPosition,
        status,
      });

      if (status) {
        await MessageService.send({
          title: `Promotion ${status}`,
          feature: AppFeatures.PROMOTION,
          message: 'Promotion request ' + status,
          metadata: {},
          actionBy: req.employee.id,
          actionFor: promotion.employee?.id,
          actionTo: [promotion.employee?.id],
          documents: ['approvedUrl1'],
        });
      }
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
