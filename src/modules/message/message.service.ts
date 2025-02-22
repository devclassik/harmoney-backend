import { onlineUsers, io } from '@/services/io.service';
import {
  AppDataSource,
  AppFeatures,
  Employee,
  AppMessage,
  Document,
} from '@/database';
import { NotificationService } from '../notification/notification.service';

export class MessageService {
  static async send({
    actionBy,
    actionTo,
    actionFor,
    title,
    message: msg,
    feature,
    metadata,
    documents,
    notify = true,
  }: {
    title?: string;
    message: string;
    actionBy: number;
    actionTo: number[];
    actionFor: number;
    feature: AppFeatures;
    metadata: Record<string, any>;
    documents?: string[];
    notify?: boolean;
  }) {
    const messageRepo = AppDataSource.getRepository(AppMessage);

    const message = await messageRepo.save(
      new AppMessage({
        title,
        feature,
        metadata,
        message: msg,
        actionBy: new Employee({ id: actionBy }),
        actionFor: new Employee({ id: actionFor }),
        actionTo: actionTo.map((id) => new Employee({ id })),
        attachments: documents?.map(
          (downloadUrl) => new Document({ downloadUrl }),
        ),
      }),
    );
    if (notify) {
      await NotificationService.inApp({
        message: msg,
        feature,
        actionBy,
        actionFor,
        actionTo,
        metadata,
      });
    }
    const ids = Array.from(new Set([actionBy, ...actionTo, actionFor]));

    ids.forEach((employeeId) => {
      if (employeeId) {
        const socketId = onlineUsers.get(`${employeeId}`);
        if (socketId) {
          io.to(socketId).emit('message', message);
        }
      }
    });

    return message;
  }
}
