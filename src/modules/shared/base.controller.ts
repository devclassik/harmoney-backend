import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../../middlewares';
import { MESSAGES } from '../../utils';

export class BaseController<T> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  /**
   * Get all records
   */
  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.repository.find();
      return res.status(StatusCodes.OK).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  /**
   * Get a single record by ID
   */
  public getOne = async (req: Request, res: Response): Promise<Response> => {
    const id = Number(req.params.id);

    try {
      const data = await this.repository.findOne({ where: { id } as any });

      if (!data) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Record'),
          StatusCodes.NOT_FOUND,
        );
      }

      return res.status(StatusCodes.OK).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  /**
   * Create a new record
   */
  public create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const entity = this.repository.create(req.body);
      const data = await this.repository.save(entity);

      return res.status(StatusCodes.CREATED).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
        data,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  /**
   * Update a record
   */
  public update = async (req: Request, res: Response): Promise<Response> => {
    const id = Number(req.params.id);

    try {
      let entity = await this.repository.findOne({ where: { id } as any });

      if (!entity) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Record'),
          StatusCodes.NOT_FOUND,
        );
      }

      entity = { ...entity, ...req.body };

      const updatedData = await this.repository.save(entity);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
        data: updatedData,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  /**
   * Delete a record
   */
  public delete = async (req: Request, res: Response): Promise<Response> => {
    const id = Number(req.params.id);

    try {
      const entity = await this.repository.findOne({ where: { id } as any });

      if (!entity) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Record'),
          StatusCodes.NOT_FOUND,
        );
      }

      await this.repository.remove(entity);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  /**
   * Handle Errors
   */
  private handleError(error: any, res: Response): Response {
    return res
      .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
}
