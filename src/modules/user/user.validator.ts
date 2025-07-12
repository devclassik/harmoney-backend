import Joi from 'joi';

export const getUserByNameSchema = Joi.object({
    name: Joi.string().min(1).required(),
}); 