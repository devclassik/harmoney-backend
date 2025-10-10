import { Request, Response } from 'express';
import { AppDataSource, AppFeatures, Employee, Template, Transfer } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';
import { MessageService } from '../message/message.service';
import { mapLeaveTypeToTemplate } from '@/utils/helper';
import { transferPDF } from '@/utils/pdfWriter';

export class TransferController {
  private transferRepo = AppDataSource.getRepository(Transfer);
  private templateRepo = AppDataSource.getRepository(Template);
  private baseService = new BaseService(this.transferRepo);
  private templateBaseService = new BaseService(this.templateRepo);
  private employeeBaseService = new BaseService(
    AppDataSource.getRepository(Employee),
  );

  public create = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const {
      employeeId,
      reason,
      transferType,
      newPosition,
      destination,
      status,
    } = req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });
      const transfer = await this.baseService.create({
        reason,
        transferType,
        newPosition,
        destination,
        employee,
      });

      await MessageService.send({
        title: `Transfer ${status || 'Request'}`,
        feature: AppFeatures.TRANSFER,
        message: 'Transfer request submitted',
        metadata: {},
        actionBy: req.employee.id,
        actionFor: employeeId,
        actionTo: [employeeId],
        documents: ['request url'],
      });

      return this.baseService.createdResponse(res, transfer);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const transferId = Number(req.params.transferId);
    const { reason, transferType, newPosition, destination, status } = req.body;

    try {
      const transfer = await this.baseService.findById({
        id: transferId,
        resource: 'Transfer',
        relations: ['employee'],
      });

      const url = await this.templateBaseService.findAll({
        where: { type: mapLeaveTypeToTemplate('TRANSFER') },
      });

      if (status === 'APPROVED' && (!transfer.letterUrl || transfer.letterUrl.trim() === '')) {
        const letter = await transferPDF(
          url[0].downloadUrl,
          `${transfer?.employee?.firstName || ''} ${transfer?.employee?.lastName || ''}`,
          status,
          transfer.destination,
          transfer.newPosition,
          transfer.reason,
          transfer.transferType,
          transfer.updatedAt
        );
        transfer.letterUrl = letter;
      }

      const updatedTransfer = await this.transferRepo.save({
        ...transfer,
        reason,
        transferType,
        newPosition,
        destination,
        status,
      });

      if (status) {
        await MessageService.send({
          title: `Transfer ${status}`,
          feature: AppFeatures.TRANSFER,
          message: 'Transfer request ' + status,
          metadata: {},
          actionBy: req.employee.id,
          actionFor: transfer.employee?.id,
          actionTo: [transfer.employee?.id],
          documents: ['approvedUrl1'],
        });
      }
      return this.baseService.updatedResponse(res, updatedTransfer);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const transferId = Number(req.params.transferId);

    try {
      const transfer = await this.baseService.findById({
        id: transferId,
        resource: 'Transfer',
        relations: ['employee', 'employee.user'],
      });
      const history = await this.transferRepo.find({
        where: {
          id: Not(transferId),
          employee: { id: transfer.employee.id },
        },
      });

      return this.baseService.successResponse(res, { ...transfer, history });
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
    const transferId = Number(req.params.transferId);

    try {
      await this.baseService.delete({
        id: transferId,
        resource: 'Transfer',
        res,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
