import { AppDataSource, Appraisal, AppraisalScore, User } from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';

export class AppraisalController {
  private appraisalRepo = AppDataSource.getRepository(Appraisal);
  private baseService = new BaseService(this.appraisalRepo);

  // Create Appraisal
  public create = async (
    req: Request & { user: User },
    res: Response,
  ): Promise<Response> => {
    const employee = req.user.employee;
    const { startDate, endDate, averageScore, scores: aScores } = req.body;

    try {
      const scores = aScores.map(
        ({ score, criterial }) => new AppraisalScore({ score, criterial }),
      );
      const appraisal = await this.baseService.create({
        startDate,
        endDate,
        averageScore,
        scores,
        employee,
      });
      return await this.baseService.createdResponse(res, appraisal);
    } catch (error) {
      return this.baseService.catchErrorResponse(res, error);
    }
  };

  // Update Appraisal
  public update = async (req: Request, res: Response): Promise<Response> => {
    const appraisalId = Number(req.params.appraisalId);
    const { startDate, endDate, averageScore, scores: aScores } = req.body;

    try {
      const appraisal = await this.baseService.findById({
        id: appraisalId,
        resource: 'Appraisal',
        relations: ['scores'],
      });

      let scores: AppraisalScore[];

      if (aScores?.length) {
        await this.appraisalRepo.recover(appraisal.scores);
        scores = aScores.map(
          ({ score, criterial }) => new AppraisalScore({ score, criterial }),
        );
      }

      const updatedAppraisal = await this.appraisalRepo.save({
        ...appraisal,
        startDate,
        endDate,
        averageScore,
        ...(scores && { scores }),
      });

      return this.baseService.updatedResponse(res, updatedAppraisal);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  // Get a Single Appraisal
  public get = async (req: Request, res: Response): Promise<Response> => {
    const appraisalId = Number(req.params.appraisalId);

    try {
      const appraisal = await this.baseService.findById({
        id: appraisalId,
        resource: 'Appraisal',
        relations: ['scores', 'employee', 'employee.user'],
      });

      return this.baseService.updatedResponse(res, appraisal);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  // Get All Appraisals
  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: ['scores', 'employee', 'employee.user'],
      });
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
    }
  };

  // Delete Appraisal
  public delete = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const appraisalId = Number(req.params.appraisalId);

    try {
      await this.baseService.delete({
        id: appraisalId,
        resource: 'Appraisal',
      });
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };
}
