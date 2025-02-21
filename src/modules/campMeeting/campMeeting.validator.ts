import Joi from 'joi';

export const createCampMeetingSchema = Joi.object({
  name: Joi.string().optional(),
  agenda: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  attendees: Joi.array().items(Joi.number().required()).required(),
});

export const updateCampMeetingSchema = createCampMeetingSchema
  .fork(['name', 'agenda', 'startDate', 'endDate', 'attendees'], (schema) =>
    schema.optional(),
  )
  .min(1)
  .message('Nothing to update');

export const getCampMeetingSchema = Joi.object({
  meetingId: Joi.number().integer().positive().required(),
});

export const deleteCampMeetingSchema = Joi.object({
  meetingId: Joi.number().integer().positive().required(),
});

export const assignRoomSchema = Joi.object({
  meetingId: Joi.number().integer().positive().required(),
  roomId: Joi.number().integer().positive().required(),
  employeeId: Joi.number().integer().positive().required(),
});
