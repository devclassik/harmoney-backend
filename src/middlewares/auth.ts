import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AppDataSource, User } from '../database';

dotenv.config();

export interface TokenDto {
  id: number;
  email: string;
  rememberMe: Boolean;
}

/**
 * Create a bcrypt hashed password
 * @param password
 * @returns
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt: string = await bcrypt.genSalt();

  const hashed: string = await bcrypt.hash(password, salt);

  return hashed;
};

/**
 * Create JWT
 * @param data
 * @returns
 */
export const createToken = (data: TokenDto) => {
  let maxAge: number = 1 * 24 * 60 * 60; // 1 day default
  const { rememberMe } = data;
  const secret: string = process.env.JWT_SECRET as string;

  if (rememberMe && rememberMe === true) {
    maxAge = 30 * 24 * 60 * 60; // 30 day
    return jwt.sign({ data }, secret, { expiresIn: maxAge });
  }
  return jwt.sign({ data }, secret, { expiresIn: maxAge });
};

/**
 * Regenerate JWT
 * @param req
 * @param res
 * @returns
 */
export const regenerateToken = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const token = createToken({
      id: res.locals.user.id,
      email: res.locals.user.email,
      rememberMe: res.locals.user.rememberMe,
    });

    return res.status(StatusCodes.OK).json({ token });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
};

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
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  } else {
    const [tokenType, token] = req.headers?.authorization.split(' ');
    if (token && tokenType === 'Bearer') {
      const secret: string = process.env.JWT_SECRET as string;
      jwt.verify(token, secret, async (err, decodedToken) => {
        if (err) {
          console.log(err);
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ error: 'Session Expired' });
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
              .json({ error: 'Unauthorized' });
          }

          req.user = user;

          next();
        }
      });
    }
  }
};
