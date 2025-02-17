import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { capitalizeFirst } from '../utils/helper';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isGet = req.method === 'GET';
    const isDelete = req.method === 'DELETE';

    const { error } = schema.validate(
      isGet || isDelete ? { ...req.params, ...req.query } : req.body,
      {
        abortEarly: false,
      },
    );

    if (error) {
      let message = error.details?.[0]?.message || 'Invalid request data';
      message = capitalizeFirst(message?.replace(/"/g, ''));

      return res.status(400).json({
        code: 400,
        status: 'error',
        message,
      });
    }

    next();
  };
};
