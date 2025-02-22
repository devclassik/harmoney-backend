import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';
import { AppDataSource, AppMessage, Employee, AppFeatures } from 'src/database';
import { MessageService } from './message.service';

export class MessageController {
  private messageRepo = AppDataSource.getRepository(AppMessage);
  private baseService = new BaseService(this.messageRepo);

  public create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const message = await MessageService.send({
        message: 'Sending a message from te backend  service of harmony',
        feature: AppFeatures.ACCOMMODATION,
        actionBy: 1,
        actionFor: 1,
        actionTo: [1],
        metadata: { mata: ' strin' },
      });
      return await this.baseService.createdResponse(res, message);
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public markAsRead = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { messageIds } = req.body;

    try {
      const messages = await this.baseService.findByIds({
        validate: true,
        ids: messageIds,
        resource: 'Messages',
      });

      messages.forEach((message) => (message.isRead = true));
      this.messageRepo.save(messages);

      return await this.baseService.createdResponse(res, messages);
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public get = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const messageId = Number(req.params.messageId);

    try {
      const message = await this.baseService.findById({
        id: messageId,
        relations: ['actionTo', 'actionBy', 'actionFor'],
      });

      return this.baseService.updatedResponse(res, message);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const id = req.employee?.id;

    try {
      const messages = await this.messageRepo.find({
        where: [
          { actionBy: { id } },
          { actionFor: { id } },
          { actionTo: { id } },
        ],
        relations: ['actionTo', 'actionBy', 'actionFor'],
      });
      return this.baseService.updatedResponse(res, messages);
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const messageId = Number(req.params.messageId);

    try {
      await this.baseService.delete({
        id: messageId,
        resource: 'AppMessage',
      });
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };
}
