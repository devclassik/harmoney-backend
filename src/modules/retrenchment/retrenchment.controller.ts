import { Request, Response } from 'express';
import { AppDataSource, AppFeatures, Employee, Retrenchment, Template } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';
import { MessageService } from '../message/message.service';
import { mapLeaveTypeToTemplate } from '@/utils/helper';
import { retrenchmentPDF } from '@/utils/pdfWriter';

export class RetrenchmentController {
  private retrenchmentRepo = AppDataSource.getRepository(Retrenchment);
  private templateRepo = AppDataSource.getRepository(Template);
  private baseService = new BaseService(this.retrenchmentRepo);
  private templateBaseService = new BaseService(this.templateRepo);
  private employeeBaseService = new BaseService(
    AppDataSource.getRepository(Employee),
  );

  public create = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const { employeeId, reason, retrenchmentType, status } = req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });
      const retrenchment = await this.baseService.create({
        reason,
        retrenchmentType,
        employee,
      });

      await MessageService.send({
        title: `Retrenchment ${status || 'Request'}`,
        feature: AppFeatures.RETRENCHMENT,
        message: 'Retrenchment request submitted',
        metadata: {},
        actionBy: req.employee.id,
        actionFor: employeeId,
        actionTo: [employeeId],
        documents: ['request url'],
      });

      return this.baseService.createdResponse(res, retrenchment);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const retrenchmentId = Number(req.params.retrenchmentId);
    const { reason, retrenchmentType, status } = req.body;

    try {
      const retrenchment = await this.baseService.findById({
        id: retrenchmentId,
        resource: 'Retrenchment',
        relations: ['employee'],
      });

      const url = await this.templateBaseService.findAll({
        where: { type: mapLeaveTypeToTemplate('RETRENCHMENT') },
      });

      if (status === 'APPROVED' && (!retrenchment.letterUrl || retrenchment.letterUrl.trim() === '')) {
        const letter = await retrenchmentPDF(
          url[0].downloadUrl,
          `${retrenchment?.employee?.firstName || ''} ${retrenchment?.employee?.lastName || ''}`,
          status,
          retrenchment.reason,
          retrenchment.retrenchmentType,
          retrenchment.updatedAt
        );
        retrenchment.letterUrl = letter;
      }

      const updatedRetrenchment = await this.retrenchmentRepo.save({
        ...retrenchment,
        reason,
        retrenchmentType,
        status,
      });

      if (status) {
        await MessageService.send({
          title: `Retrenchment ${status}`,
          feature: AppFeatures.RETRENCHMENT,
          message: 'Retrenchment request ' + status,
          metadata: {},
          actionBy: req.employee.id,
          actionFor: retrenchment.employee?.id,
          actionTo: [retrenchment.employee?.id],
          documents: ['approvedUrl1'],
        });
      }

      return this.baseService.updatedResponse(res, updatedRetrenchment);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const retrenchmentId = Number(req.params.retrenchmentId);

    try {
      const retrenchment = await this.baseService.findById({
        id: retrenchmentId,
        resource: 'Retrenchment',
        relations: ['employee', 'employee.user'],
      });
      const history = await this.retrenchmentRepo.find({
        where: {
          id: Not(retrenchmentId),
          employee: { id: retrenchment.employee.id },
        },
      });

      return this.baseService.successResponse(res, {
        ...retrenchment,
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
        relations: ['employee', 'employee.user'],
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const retrenchmentId = Number(req.params.retrenchmentId);

    try {
      await this.baseService.delete({
        id: retrenchmentId,
        resource: 'Retrenchment',
        res,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
