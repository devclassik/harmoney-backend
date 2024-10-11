import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource, MerchantBusiness, User, Wallet } from '../database';
import { apiResponse, MESSAGES } from '../utils';
import bcrypt from 'bcrypt';

/**
 * Ensure user provides correct transaction pin to access requested resource.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const trnxPinGuard = async (
  req: Request<any, any, any, any> & {
    user: User;
    business: MerchantBusiness;
    wallet: Wallet;
  },
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const user = req.user;
  const { pin } = req.body;

  const wallet = await AppDataSource.getRepository(Wallet).findOne({
    where: { user: new User({ id: user.id }) },
  });

  if (!wallet) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(apiResponse('error', MESSAGES.RESOURCE_NOT_FOUND('Wallet')));
  }

  if (!wallet.txPin) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(apiResponse('error', 'Transaction Pin not setup.'));
  }

  const correctPin = await bcrypt.compare(pin, wallet.txPin);

  if (!correctPin) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(apiResponse('error', MESSAGES.INVALID_RESOURCE('Transaction Pin')));
  }

  req.wallet = wallet;

  next();
};
