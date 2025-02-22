import { getRepository } from 'typeorm';
import { onlineUsers, io } from 'src/services/io.service';
import {
  AppDataSource,
  AppFeatures,
  Employee,
  Notification,
} from 'src/database';

export class NotificationService {
  static async inApp({
    actionBy,
    actionTo,
    actionFor,
    title,
    message,
    feature,
    metadata,
  }: {
    title?: string;
    message: string;
    actionBy: number;
    actionTo: number[];
    actionFor: number;
    feature: AppFeatures;
    metadata: Record<string, any>;
  }) {
    const notificationRepo = AppDataSource.getRepository(Notification);

    const notification = await notificationRepo.save(
      new Notification({
        title,
        message,
        feature,
        metadata,
        actionBy: new Employee({ id: actionBy }),
        actionFor: new Employee({ id: actionFor }),
        actionTo: actionTo.map((id) => new Employee({ id })),
      }),
    );

    const ids = Array.from(new Set([actionBy, ...actionTo, actionFor]));

    ids.forEach((employeeId) => {
      if (employeeId) {
        const socketId = onlineUsers.get(`${employeeId}`);
        if (socketId) {
          io.to(socketId).emit('notification', notification);
        }
      }
    });

    return notification;
  }
}
