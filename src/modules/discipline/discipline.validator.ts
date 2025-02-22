import {
  DisciplineTypes,
  DurationUnit,
  PositionTypes,
  Status,
} from 'src/database/enum';
import Joi from 'joi';

export const createDisciplineSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  duration: Joi.number().integer().positive().required(),
  reason: Joi.string().required(),
  durationUnit: Joi.string()
    .valid(...Object.values(DurationUnit))
    .required(),
  disciplineType: Joi.string()
    .valid(...Object.values(DisciplineTypes))
    .required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const updateDisciplineSchema = createDisciplineSchema
  .fork(
    [
      'duration',
      'status',
      'reason',
      'durationUnit',
      'disciplineType',
      'employeeId',
    ],
    (schema) => schema.optional(),
  )
  .append({
    status: Joi.string()
      .valid(...Object.values(Status))
      .optional(),
  })
  .min(1)
  .message('Nothing to update');

export const getDisciplineSchema = Joi.object({
  disciplineId: Joi.number().integer().positive().required(),
});

export const deleteDisciplineSchema = Joi.object({
  disciplineId: Joi.number().integer().positive().required(),
});
