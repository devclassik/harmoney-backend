import Joi from 'joi';

export const createOrganizationSchema = Joi.object({
  name: Joi.string().required(),
});

export const updateOrganizationSchema = Joi.object({
  name: Joi.string().required(),
});

export const getOrganizationSchema = Joi.object({
  organizationId: Joi.number().required(),
});

export const deleteOrganizationSchema = Joi.object({
  organizationId: Joi.number().required(),
});
