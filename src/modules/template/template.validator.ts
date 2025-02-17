import { TemplateTypes } from '../../database';
import Joi from 'joi';

export const createTemplateSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(TemplateTypes))
    .required(),
});

export const updateTemplateSchema = Joi.object({
  templateId: Joi.string().trim().optional(),
  type: Joi.string()
    .valid(...Object.values(TemplateTypes))
    .optional(),
});

export const getTemplateSchema = Joi.object({
  templateId: Joi.string().required(),
});

export const deleteTemplateSchema = Joi.object({
  templateId: Joi.string().required(),
});
