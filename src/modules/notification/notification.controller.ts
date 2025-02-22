import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';
import {
  AppDataSource,
  Notification,
  Employee,
  AppFeatures,
} from 'src/database';
import { NotificationService } from './notification.service';

export class NotificationController {
  private notificationRepo = AppDataSource.getRepository(Notification);
  private baseService = new BaseService(this.notificationRepo);

  public create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const notification = await NotificationService.inApp({
        message: 'Sending a message from te backend  service of harmony',
        feature: AppFeatures.ACCOMMODATION,
        actionBy: 1,
        actionFor: 1,
        actionTo: [1],
        metadata: { mata: ' strin' },
      });
      return await this.baseService.createdResponse(res, notification);
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public markAsRead = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { notificationIds } = req.body;

    try {
      const notifications = await this.baseService.findByIds({
        validate: true,
        ids: notificationIds,
        resource: 'Notifications',
      });

      notifications.forEach((notification) => (notification.isRead = true));
      this.notificationRepo.save(notifications);

      return await this.baseService.createdResponse(res, notifications);
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public get = async (
    req: Request & { employee: Employee },
    res: Response,
  ): Promise<Response> => {
    const notificationId = Number(req.params.notificationId);

    try {
      const notification = await this.baseService.findById({
        id: notificationId,
        relations: ['actionTo', 'actionBy', 'actionFor'],
      });

      return this.baseService.updatedResponse(res, notification);
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
      const notifications = await this.notificationRepo.find({
        where: [
          { actionBy: { id } },
          { actionFor: { id } },
          { actionTo: { id } },
        ],
        relations: ['actionTo', 'actionBy', 'actionFor'],
      });
      return this.baseService.updatedResponse(res, notifications);
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const notificationId = Number(req.params.notificationId);

    try {
      await this.baseService.delete({
        id: notificationId,
        resource: 'Notification',
      });
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };
}
