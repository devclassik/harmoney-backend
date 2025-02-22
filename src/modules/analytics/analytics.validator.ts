import { Status } from 'src/database/enum';
import Joi from 'joi';

export const getStatSchema = Joi.object({
  year: Joi.number().min(2000).max(new Date().getFullYear()).optional(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const getPerformanceStatSchema = Joi.object({
  year: Joi.number().min(2000).max(new Date().getFullYear()).optional(),
  employeeId: Joi.number().integer().positive().required(),
});
