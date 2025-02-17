import { AppDataSource, Accommodation } from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';

export class AccommodationController {
  private accommodationRepo = AppDataSource.getRepository(Accommodation);
  private baseService = new BaseService(
    AppDataSource.getRepository(Accommodation),
  );

  public create = async (req: Request, res: Response): Promise<Response> => {
    const { name, type, isPetAllowed, rooms } = req.body;

    try {
      await this.baseService.isPropertyTaken(
        'name',
        name,
        'Accommodation name',
      );
      const accommodation = await this.baseService.create({
        name,
        type,
        isPetAllowed,
        rooms,
      });
      return await this.baseService.createdResponse(res, accommodation);
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const accommodationId = Number(req.params.accommodationId);
    const { name, type, isPetAllowed, rooms } = req.body;

    await this.baseService.isPropertyTaken('name', name, 'Accommodation name');

    try {
      const accommodation = await this.baseService.findById({
        id: accommodationId,
        resource: 'Accommodation',
        relations: ['rooms'],
      });

      const data = await this.accommodationRepo.save({
        ...accommodation,
        name,
        type,
        isPetAllowed,
        rooms,
      });

      return this.baseService.updatedResponse(res, data);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const accommodationId = Number(req.params.accommodationId);

    try {
      const accommodation = await this.baseService.findById({
        id: accommodationId,
        resource: 'Accommodation',
        relations: ['rooms'],
      });

      return this.baseService.successResponse(res, accommodation);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({
        res,
        relations: ['rooms'],
      });
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const accommodationId = Number(req.params.accommodationId);

    try {
      await this.baseService.delete({
        id: accommodationId,
        resource: 'Accommodation',
      });
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };
}
