import Joi from 'joi';

export const markAsReadSchema = Joi.object({
  notificationIds: Joi.array().items(Joi.number().required()).required(),
});
