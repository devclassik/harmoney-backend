import { Request, Response } from 'express';
import { AppDataSource, Employee, Discipline } from '@/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';

export class DisciplineController {
  private disciplineRepo = AppDataSource.getRepository(Discipline);
  private baseService = new BaseService(this.disciplineRepo);
  private employeeBaseService = new BaseService(
    AppDataSource.getRepository(Employee),
  );

  public create = async (req: Request, res: Response): Promise<Response> => {
    const { employeeId, reason, disciplineType, duration, durationUnit } =
      req.body;

    try {
      const employee = await this.employeeBaseService.findById({
        id: employeeId,
      });
      await this.baseService.create(
        {
          reason,
          disciplineType,
          duration,
          durationUnit,
          employee,
        },
        res,
      );
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const disciplineId = Number(req.params.disciplineId);
    const { reason, disciplineType, duration, durationUnit, status } = req.body;

    try {
      const discipline = await this.baseService.findById({
        id: disciplineId,
        resource: 'Discipline',
      });

      const updatedDiscipline = await this.disciplineRepo.save({
        ...discipline,
        reason,
        disciplineType,
        duration,
        durationUnit,
        status,
      });

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
