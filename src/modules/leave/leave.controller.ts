import { Request, Response } from 'express';
import {
  AppDataSource,
  Leave,
  Document,
  User,
  Employee,
  AppFeatures,
} from 'src/database';
import { BaseService } from '../shared/base.service';
import { getNumberOfDays } from 'src/utils/helper';
import { DurationUnit, LeaveTypes } from 'src/database/enum';
import { Not } from 'typeorm';
import { MessageService } from '../message/message.service';

export class LeaveController {
  private employeeRepo = AppDataSource.getRepository(Employee);
  private leaveRepo = AppDataSource.getRepository(Leave);
  private docRepo = AppDataSource.getRepository(Document);
  private baseService = new BaseService(this.leaveRepo);
  private employeeBaseService = new BaseService(this.employeeRepo);

  public setDurationToReq(req: Request) {
    const { startDate, endDate } = req.body;

    if (startDate && endDate) {
      req.body.duration = getNumberOfDays(startDate, endDate);
      req.body.durationUnit = DurationUnit.DAY;
    }
  }

  public createAnnualLeave = async (
    req: Request & { user: User },
    res: Response,
  ): Promise<Response> => {
    req.body.type = LeaveTypes.ANNUAL;
    this.setDurationToReq(req);

    return await this.create(req, res);
  };

  public updateAnnualLeave = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return await this.update(req, res);
  };

  public getAllAnnualLeaves = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return await this.getAll(req, res, LeaveTypes.ANNUAL);
  };

  public createAbsenceLeave = async (
    req: Request & { user: User },
    res: Response,
  ): Promise<Response> => {
    req.body.type = LeaveTypes.ABSENCE;
    return await this.create(req, res);
  };

  public updateAbsenceLeave = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return await this.update(req, res);
  };

  public getAllAbsenceLeaves = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return await this.getAll(req, res, LeaveTypes.ABSENCE);
  };

  public createSickLeave = async (
    req: Request & { user: User },
    res: Response,
  ): Promise<Response> => {
    req.body.type = LeaveTypes.SICK;
    return await this.create(req, res);
  };

  public updateSickLeave = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return await this.update(req, res);
  };

  public getAllSickLeaves = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return await this.getAll(req, res, LeaveTypes.SICK);
  };

  public getLeave = async (req: Request, res: Response): Promise<Response> => {
    try {
      const leave = await this.baseService.findById({
        id: Number(req.params.leaveId),
        resource: 'Leave',
        relations: ['leaveNotes', 'employee', 'employee.user'],
      });

      const history = await this.baseService.findAll({
        where: { id: Not(leave.id), type: leave.type },
      });

      return await this.baseService.successResponse(res, { ...leave, history });
    } catch (error) {
      return this.baseService.catchErrorResponse(res, error);
    }
  };

  public getAll = async (
    req: Request,
    res: Response,
    type?: LeaveTypes,
  ): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: ['leaveNotes', 'employee', 'employee.user'],
        where: { type },
      });
    } catch (error) {
      return this.baseService.catchErrorResponse(res, error);
    }
  };

  public create = async (
    req: Request & { user: User },
    res: Response,
  ): Promise<Response> => {
    const updateData = req.body;
    const { leaveNotesUrls, employeeId, status } = updateData;
    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
        resource: 'Employee',
      });

      const leave = new Leave(updateData);

      if (leaveNotesUrls?.length) {
        leave.leaveNotes = leaveNotesUrls.map(
          (downloadUrl) => new Document({ downloadUrl }),
        );
      }
      leave.employee = employee;
      await this.leaveRepo.save(leave);

      await MessageService.send({
        title: `${leave.type} Leave ${status || 'Request'}`,
        feature: AppFeatures.LEAVE,
        message: `${leave.type} Leave request submitted`,
        metadata: {},
        actionBy: req.user.employee.id,
        actionFor: employeeId,
        actionTo: [employeeId],
        documents: ['request url'],
      });

      return await this.baseService.createdResponse(res, leave);
    } catch (error) {
      return this.baseService.catchErrorResponse(res, error);
    }
  };

  public update = async (
    req: Request & { employee?: Employee },
    res: Response,
  ): Promise<Response> => {
    const updateData = req.body;
    const { leaveNotesUrls, status } = updateData;

    try {
      const leave = await this.baseService.findById({
        id: Number(req.params.leaveId),
        resource: 'Leave',
        relations: ['leaveNotes', 'employee'],
      });

      Object.assign(leave, req.body);
      if (leaveNotesUrls?.length && leave.leaveNotes?.length) {
        await this.docRepo.remove(leave.leaveNotes);
        leave.leaveNotes = leaveNotesUrls.map(
          (downloadUrl) => new Document({ downloadUrl }),
        );
      }

      await this.leaveRepo.save(leave);

      if (status) {
        await MessageService.send({
          title: `${leave.type} Leave ${status || 'Request'}`,
          feature: AppFeatures.LEAVE,
          message: `${leave.type} Leave request submitted`,
          metadata: {},
          actionBy: req.employee?.id,
          actionFor: leave.employee?.id,
          actionTo: [leave.employee?.id],
          documents: ['request url'],
        });
      }

      return await this.baseService.successResponse(res, leave);
    } catch (error) {
      return this.baseService.catchErrorResponse(res, error);
    }
  };

  public deleteLeave = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      await this.baseService.delete({
        id: Number(req.params.leaveId),
        resource: 'Leave',
        res,
      });
    } catch (error) {
      return this.baseService.catchErrorResponse(res, error);
    }
  };
}
