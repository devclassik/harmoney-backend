import Joi from 'joi';
import { AccommodationTypes } from '../../database';

export const createAccommodationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  type: Joi.string()
    .valid(...Object.values(AccommodationTypes))
    .required(),
  isPetAllowed: Joi.boolean().optional(),
  rooms: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(1).max(255).required(),
        capacity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});

export const updateAccommodationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional(),
  type: Joi.string()
    .valid(...Object.values(AccommodationTypes))
    .optional(),
  isPetAllowed: Joi.boolean().optional(),
  rooms: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(1).max(255).optional(),
        capacity: Joi.number().integer().min(1).optional(),
        id: Joi.number().integer().optional(),
      }),
    )
    .optional(),
});

export const getAccommodationSchema = Joi.object({
  accommodationId: Joi.number().required(),
});

export const deleteAccommodationSchema = Joi.object({
  accommodationId: Joi.number().required(),
});
