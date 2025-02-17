import Joi from 'joi';

export const createDepartmentSchema = Joi.object({
  name: Joi.string().required(),
  hod: Joi.number().optional(),
  members: Joi.array().items(Joi.number()).optional(),
  organizationId: Joi.number().required(),
});

export const updateDepartmentSchema = Joi.object({
  name: Joi.string().required(),
  hod: Joi.number().optional(),
  members: Joi.array().items(Joi.number()).optional(),
  memberToAdd: Joi.array().items(Joi.number()).optional(),
  membersToRemove: Joi.array().items(Joi.number()).optional(),
});

export const getDepartmentSchema = Joi.object({
  departmentId: Joi.number().required(),
});

export const deleteDepartmentSchema = Joi.object({
  departmentId: Joi.number().required(),
});
