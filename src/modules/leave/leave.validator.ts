import { Router } from 'express';
import Joi from 'joi';
import { DurationUnit, Status } from '@/database/enum';

// Validation Schemas
export const baseLeaveSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  startDate: Joi.date().required(),
  reason: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const createAnnualLeaveSchema = baseLeaveSchema.keys({
  endDate: Joi.date().required(),
});

export const updateAnnualLeaveSchema = createAnnualLeaveSchema
  .fork(['startDate', 'reason', 'endDate', 'status', 'employeeId'], (schema) =>
    schema.optional(),
  )
  .min(1)
  .message('Nothing to update')
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

export const createAbsenceLeaveSchema = baseLeaveSchema.keys({
  location: Joi.string().optional(),
  duration: Joi.number().required(),
  durationUnit: Joi.string()
    .valid(...Object.values(DurationUnit))
    .required(),
  leaveNotesUrls: Joi.array().items(Joi.string().uri()).optional(),
});

export const updateAbsenceLeaveSchema = createAbsenceLeaveSchema
  .fork(
    [
      'status',
      'employeeId',
      'startDate',
      'reason',
      'location',
      'duration',
      'durationUnit',
      'leaveNotesUrls',
    ],
    (schema) => schema.optional(),
  )
  .min(1)
  .message('Nothing to update');

export const createSickLeaveSchema = createAbsenceLeaveSchema;
export const updateSickLeaveSchema = updateAbsenceLeaveSchema;

export const getLeaveSchema = Joi.object({
  leaveId: Joi.number().required(),
});

export const deleteLeaveSchema = getLeaveSchema;

export const getLeavesByEmployeeSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
});

export const getLeavesByTypeSchema = Joi.object({
  type: Joi.string().valid('ANNUAL', 'ABSENCE', 'SICK').required(),
});

export const getLeavesByTypeAndEmployeeSchema = Joi.object({
  type: Joi.string().valid('ANNUAL', 'ABSENCE', 'SICK').required(),
  employeeId: Joi.number().integer().positive().required(),
});
