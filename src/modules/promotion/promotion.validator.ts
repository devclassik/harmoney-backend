import { PositionTypes, Status } from '@/database/enum';
import Joi from 'joi';

export const createPromotionSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  newPosition: Joi.string()
    .valid(...Object.values(PositionTypes))
    .required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const updatePromotionSchema = createPromotionSchema
  .fork(['newPosition', 'status'], (schema) => schema.optional())
  .min(1)
  .message('Nothing to update');

export const getPromotionSchema = Joi.object({
  promotionId: Joi.number().integer().positive().required(),
});

export const deletePromotionSchema = Joi.object({
  promotionId: Joi.number().integer().positive().required(),
});
