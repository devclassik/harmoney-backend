import { RetrenchmentTypes, Status } from '@/database/enum';
import Joi from 'joi';

export const createRetrenchmentSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  reason: Joi.string().required(),
  retrenchmentType: Joi.string()
    .valid(...Object.values(RetrenchmentTypes))
    .required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const updateRetrenchmentSchema = createRetrenchmentSchema
  .fork(['status', 'reason', 'retrenchmentType', 'employeeId'], (schema) =>
    schema.optional(),
  )
  .min(1)
  .message('Nothing to update');

export const getRetrenchmentSchema = Joi.object({
  retrenchmentId: Joi.number().integer().positive().required(),
});

export const deleteRetrenchmentSchema = Joi.object({
  retrenchmentId: Joi.number().integer().positive().required(),
});
