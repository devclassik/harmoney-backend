import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource, MerchantBusiness, User } from '../database';
import { apiResponse } from '../utils';

/**
 * Ensure user has a business to access requested resource.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const businessGuard = async (
  req: Request<any, any, any, any> & {
    user: User;
    business: MerchantBusiness;
  },
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const user = req.user;

  const business = await AppDataSource.getRepository(MerchantBusiness).findOne({
    where: { merchant: new User({ id: user.id }) },
  });

  if (!business) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(apiResponse('error', 'You cannot perform this action.'));
  }

  req.business = business;

  next();
};
