import { Request, Response } from 'express';
import { AppDataSource, Employee, FileIndex } from 'src/database';
import { BaseService } from '../shared/base.service';
import { Not } from 'typeorm';

export class FileIndexController {
  private fileIndexRepo = AppDataSource.getRepository(FileIndex);
  private baseService = new BaseService(this.fileIndexRepo);

  public create = async (req: Request, res: Response): Promise<Response> => {
    const { name, fileType, downloadUrl } = req.body;

    try {
      await this.baseService.create(
        {
          name,
          fileType,
          downloadUrl,
        },
        res,
      );
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    const fileIndexId = Number(req.params.fileIndexId);
    const { name, fileType, duration, downloadUrl, status } = req.body;

    try {
      const fileIndex = await this.baseService.findById({
        id: fileIndexId,
        resource: 'FileIndex',
      });

      const updatedFileIndex = await this.fileIndexRepo.save({
        ...fileIndex,
        name,
        fileType,
        downloadUrl,
      });

      return this.baseService.updatedResponse(res, updatedFileIndex);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const fileIndexId = Number(req.params.fileIndexId);

    try {
      const fileIndex = await this.baseService.findById({
        id: fileIndexId,
        resource: 'FileIndex',
      });

      return this.baseService.successResponse(res, fileIndex);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this.baseService.findAll({ res });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    const fileIndexId = Number(req.params.fileIndexId);

    try {
      await this.baseService.delete({
        id: fileIndexId,
        resource: 'FileIndex',
        res,
      });
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };
}
