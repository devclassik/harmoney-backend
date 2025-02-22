import Joi from 'joi';

export const markAsReadSchema = Joi.object({
  messageIds: Joi.array().items(Joi.number().required()).required(),
});
