import {
  DurationUnit,
  PositionTypes,
  Status,
  TransferTypes,
} from 'src/database/enum';
import Joi from 'joi';

export const createTransferSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  reason: Joi.string().required(),
  destination: Joi.string().required(),
  newPosition: Joi.string()
    .valid(...Object.values(PositionTypes))
    .required(),
  transferType: Joi.string()
    .valid(...Object.values(TransferTypes))
    .required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const updateTransferSchema = createTransferSchema
  .fork(
    [
      'newPosition',
      'status',
      'reason',
      'destination',
      'transferType',
      'employeeId',
    ],
    (schema) => schema.optional(),
  )
  .min(1)
  .message('Nothing to update');

export const getTransferSchema = Joi.object({
  TransferId: Joi.number().integer().positive().required(),
});

export const deleteTransferSchema = Joi.object({
  TransferId: Joi.number().integer().positive().required(),
});
