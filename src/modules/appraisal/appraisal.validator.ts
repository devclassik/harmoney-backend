import Joi from 'joi';
import { AppraisalCriterial } from '@/database/enum';

export const createAppraisalSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  averageScore: Joi.number().min(0).max(100).required(),
  scores: Joi.array()
    .items(
      Joi.object({
        criterial: Joi.string()
          .valid(...Object.values(AppraisalCriterial))
          .required(),
        score: Joi.number().min(0).max(100).required(),
      }),
    )
    .min(1)
    .required(),
});

export const updateAppraisalSchema = createAppraisalSchema
  .fork(['startDate', 'scores', 'endDate', 'averageScore'], (schema) =>
    schema.optional(),
  )
  .min(1)
  .message('Nothing to update')
  .with('startDate', 'endDate')
  .with('endDate', 'startDate');

export const getAppraisalSchema = Joi.object({
  appraisalId: Joi.number().integer().positive().required(),
});

export const deleteAppraisalSchema = Joi.object({
  appraisalId: Joi.number().integer().positive().required(),
});
