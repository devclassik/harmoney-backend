import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AppDataSource, User } from '../database';
import { apiResponse } from '../utils';

dotenv.config();

export interface TokenDto {
  id: number;
  email: string;
  rememberMe: Boolean;
}

/**
 * Ensure user is authenticated for requested resource.
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const authGuard = async (
  req: Request<any, any, any, any> & { user: User },
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  if (!req.headers.authorization) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json(apiResponse('error', 'Unauthorized'));
  } else {
    const [tokenType, token] = req.headers?.authorization.split(' ');
    if (token && tokenType === 'Bearer') {
      const secret: string = process.env.JWT_SECRET as string;
      jwt.verify(token, secret, async (err, decodedToken) => {
        if (err) {
          console.log(err);
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(apiResponse('error', 'Session Expired'));
        } else {
          // make user available for the next middleware
          const decodedData = decodedToken as { data: TokenDto };
          // console.log('decodedData: ', JSON.stringify(decodedData.data));

          const user = await AppDataSource.getRepository(User).findOne({
            where: { email: decodedData.data.email },
          });

          if (!user) {
            return res
              .status(StatusCodes.UNAUTHORIZED)
              .json(apiResponse('error', 'Unauthorized'));
          }

          req.user = user;

          next();
        }
      });
    }
  }
};
