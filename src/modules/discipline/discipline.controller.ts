import { Request, Response } from 'express';
import { AppDataSource, Employee, Discipline, AppFeatures, Template, TemplateTypes } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';
import { MessageService } from '../message/message.service';
import { mapLeaveTypeToTemplate } from '@/utils/helper';
import { disciplinePDF, } from '@/utils/pdfWriter';

export class DisciplineController {
  private disciplineRepo = AppDataSource.getRepository(Discipline);
  private templateRepo = AppDataSource.getRepository(Template);
  private templateBaseService = new BaseService(this.templateRepo);
  private baseService = new BaseService(this.disciplineRepo);
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
      disciplineType,
      duration,
      durationUnit,
      status,
    } = req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });
      const discipline = await this.baseService.create({
        reason,
        disciplineType,
        duration,
        durationUnit,
        employee,
      });

      await MessageService.send({
        title: `Discipline ${status || 'Request'}`,
        feature: AppFeatures.PROMOTION,
        message: 'Promotion request submitted',
        metadata: {},
        actionBy: req.employee.id,
        actionFor: employeeId,
        actionTo: [employeeId],
        documents: ['request url'],
      });

      return this.baseService.createdResponse(res, discipline);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const disciplineId = Number(req.params.disciplineId);
    const { reason, disciplineType, duration, durationUnit, status } = req.body;

    try {
      const discipline = await this.baseService.findById({
        id: disciplineId,
        resource: 'Discipline',
        relations: ['employee'],
      });

      const url = await this.templateBaseService.findAll({
        where: { type: mapLeaveTypeToTemplate('DISCIPLINE') },
      });

      if (status === 'APPROVED' && (!discipline.letterUrl || discipline.letterUrl.trim() === '')) {
        const letter = await disciplinePDF(
          url[0].downloadUrl,
          `${discipline?.employee?.firstName || ''} ${discipline?.employee?.lastName || ''}`,
          status,
          discipline.disciplineType,
          discipline.duration,
          discipline.durationUnit,
          discipline.reason || '',
        );
        discipline.letterUrl = letter;
      }

      const updatedDiscipline = await this.disciplineRepo.save({
        ...discipline,
        reason,
        disciplineType,
        duration,
        durationUnit,
        status,
      });

      if (status) {
        await MessageService.send({
          title: `Discipline ${status}`,
          feature: AppFeatures.DISCIPLINE,
          message: 'Discipline request ' + status,
          metadata: {},
          actionBy: req.employee.id,
          actionFor: discipline.employee?.id,
          actionTo: [discipline.employee?.id],
          documents: ['approvedUrl1'],
        });
      }
      return this.baseService.updatedResponse(res, updatedDiscipline);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const disciplineId = Number(req.params.disciplineId);

    try {
      const discipline = await this.baseService.findById({
        id: disciplineId,
        resource: 'Discipline',
        relations: ['employee', 'employee.user'],
      });
      const history = await this.disciplineRepo.find({
        where: {
          id: Not(disciplineId),
          employee: { id: discipline.employee.id },
        },
      });

      return this.baseService.successResponse(res, { ...discipline, history });
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
    const disciplineId = Number(req.params.disciplineId);

    try {
      await this.baseService.delete({
        id: disciplineId,
        resource: 'Discipline',
        res,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
