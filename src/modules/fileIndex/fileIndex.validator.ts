import { DocumentTypes } from '@/database/enum';
import Joi from 'joi';

export const createFileIndexSchema = Joi.object({
  name: Joi.string().required(),
  downloadUrl: Joi.string().required(),
  fileType: Joi.string()
    .valid(...Object.values(DocumentTypes))
    .required(),
});

export const updateFileIndexSchema = createFileIndexSchema
  .fork(['name', 'downloadUrl', 'fileType'], (schema) => schema.optional())
  .min(1)
  .message('Nothing to update');

export const getFileIndexSchema = Joi.object({
  fileIndexId: Joi.number().integer().positive().required(),
});

export const deleteFileIndexSchema = Joi.object({
  fileIndexId: Joi.number().integer().positive().required(),
});
