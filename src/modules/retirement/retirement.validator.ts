import { Status } from '@/database/enum';
import Joi from 'joi';

export const createRetirementSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  recommendedReplacementId: Joi.number()
    .integer()
    .positive()
    .optional()
    .invalid(Joi.ref('employeeId'))
    .messages({
      'any.invalid': 'Replacement must be different from retired employee',
    }),
  reason: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const updateRetirementSchema = createRetirementSchema
  .fork(
    ['status', 'reason', 'recommendedReplacementId', 'employeeId'],
    (schema) => schema.optional(),
  )
  .min(1)
  .message('Nothing to update');

export const getRetirementSchema = Joi.object({
  retirementId: Joi.number().integer().positive().required(),
});

export const deleteRetirementSchema = Joi.object({
  retirementId: Joi.number().integer().positive().required(),
});
