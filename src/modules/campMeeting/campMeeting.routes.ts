import { authGuard } from 'src/guards';
import { validateRequest } from 'src/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createCampMeetingSchema,
  updateCampMeetingSchema,
  getCampMeetingSchema,
  deleteCampMeetingSchema,
  assignRoomSchema,
} from './campMeeting.validator';
import { CampMeetingController } from './campMeeting.controller';

export const CampMeetingRoute = express.Router();

const controller = new CampMeetingController();

CampMeetingRoute.post(
  '/camp-meeting',
  validateRequest(createCampMeetingSchema),
  authGuard,
  controller.create,
);

CampMeetingRoute.put(
  '/camp-meeting/assign-room',
  validateRequest(assignRoomSchema),
  authGuard,
  controller.assignRoom,
);

CampMeetingRoute.put(
  '/camp-meeting/unassign-room',
  validateRequest(assignRoomSchema),
  authGuard,
  controller.assignRoom,
);

CampMeetingRoute.put(
  '/camp-meeting/:meetingId',
  validateRequest(updateCampMeetingSchema),
  authGuard,
  controller.update,
);

CampMeetingRoute.get(
  '/camp-meeting/attendees',
  authGuard,
  controller.getAllAttendee,
);
CampMeetingRoute.get(
  '/camp-meeting/attendees/:meetingId',
  authGuard,
  controller.getAllAttendee,
);

CampMeetingRoute.delete(
  '/camp-meeting/:meetingId',
  validateRequest(deleteCampMeetingSchema),
  authGuard,
  controller.delete,
);

CampMeetingRoute.get(
  '/camp-meeting/:meetingId',
  validateRequest(getCampMeetingSchema),
  authGuard,
  controller.get,
);

CampMeetingRoute.get('/camp-meeting', authGuard, controller.getAll);

export default CampMeetingRoute;
