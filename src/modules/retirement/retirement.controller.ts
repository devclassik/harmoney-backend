import { Request, Response } from 'express';
import { AppDataSource, AppFeatures, Employee, Retirement, Template } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';
import { MessageService } from '../message/message.service';
import { Status } from '@/database/enum';
import { retirementPDF } from '@/utils/pdfWriter';
import { mapLeaveTypeToTemplate } from '@/utils/helper';

export class RetirementController {
  private retirementRepo = AppDataSource.getRepository(Retirement);
  private templateRepo = AppDataSource.getRepository(Template);
  private baseService = new BaseService(this.retirementRepo);
  private templateBaseService = new BaseService(this.templateRepo);
  private employeeBaseService = new BaseService(
    AppDataSource.getRepository(Employee),
  );

  public create = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const { employeeId, reason, recommendedReplacementId, status, documents } = req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });

      const recommendedReplacement = await this.employeeBaseService.findById({
        id: recommendedReplacementId,
        canBeNull: true,
      });

      const retirement = await this.baseService.create({
        reason,
        employee,
        recommendedReplacement,
        documents
      });

      await MessageService.send({
        title: `Retirement ${status || 'Request'}`,
        feature: AppFeatures.RETIREMENT,
        message: 'Retirement request submitted',
        metadata: {},
        actionBy: req.employee.id,
        actionFor: employeeId,
        actionTo: [employeeId],
        documents: ['request url'],
      });

      return this.baseService.createdResponse(res, retirement);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const retirementId = Number(req.params.retirementId);
    const { reason, status, recommendedReplacementId, documents } = req.body;

    try {
      const retirement = await this.baseService.findById({
        id: retirementId,
        resource: 'Retirement',
        relations: ['employee'],
      });
      const recommendedReplacement = await this.employeeBaseService.findById({
        id: recommendedReplacementId,
        canBeNull: true,
      });

      const url = await this.templateBaseService.findAll({
        where: { type: mapLeaveTypeToTemplate('RETIREMENT') },
      });

      if (status === 'APPROVED' && (!retirement.letterUrl || retirement.letterUrl.trim() === '')) {
        const letter = await retirementPDF(
          url[0].downloadUrl,
          `${retirement?.employee?.firstName || ''} ${retirement?.employee?.lastName || ''}`,
          status,
          retirement.reason,
          retirement.updatedAt
        );
        retirement.letterUrl = letter;
      }

      const updatedRetirement = await this.retirementRepo.save({
        ...retirement,
        reason,
        status,
        recommendedReplacement,
        documents,
      });

      if (status) {
        await MessageService.send({
          title: `Retirement ${status}`,
          feature: AppFeatures.RETIREMENT,
          message: 'Retirement request ' + status,
          metadata: {},
          actionBy: req.employee.id,
          actionFor: retirement.employee?.id,
          actionTo: [retirement.employee?.id],
          documents: ['approvedUrl1'],
        });
      }

      if (status && status === Status.APPROVED) {
        await this.employeeBaseService.updateById({
          id: retirement.employee?.id,
          data: { ...retirement.employee, retiredDate: new Date() },
        });
      }

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
