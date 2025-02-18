import { Router } from 'express';
import Joi from 'joi';
import { DurationUnit } from '@/database/enum';
import { LeaveStatus } from '@/database';

// Validation Schemas
export const baseLeaveSchema = Joi.object({
  startDate: Joi.date().required(),
  reason: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(LeaveStatus))
    .optional(),
});

export const createAnnualLeaveSchema = baseLeaveSchema.keys({
  endDate: Joi.date().required(),
});

export const updateAnnualLeaveSchema = createAnnualLeaveSchema
  .fork(['startDate', 'reason', 'endDate', 'status'], (schema) =>
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
