import { NextFunction, Request, Response } from 'express';
import { CustomError } from './customError';
import { apiResponse, logger } from '../utils';
import { StatusCodes } from 'http-status-codes';

export class ErrorMiddleware {
  public static handleError(
    error: Error | unknown,
    req: Request<any, any, any, any>,
    res: Response,
  ): Response {
    if (error instanceof Error) {
      logger.error(
        `⚠️.⚠️.⚠️.⚠️.⚠️.⚠️.⚠️.⚠️ An error occurred ⚠️.⚠️.⚠️.⚠️.⚠️.⚠️.⚠️.⚠️ `,
      );
      logger.error(error.stack);

      const statusCode =
        error instanceof CustomError
          ? error.statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return res.status(statusCode).json(apiResponse('error', error.message));
    } else {
      logger.error(
        `⚠️*⚠️*⚠️*⚠️*⚠️*⚠️*⚠️*⚠️ An UNKNOWN error occurred ⚠️*⚠️*⚠️*⚠️*⚠️*⚠️*⚠️*⚠️ `,
      );
      logger.error(error);

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(apiResponse('error', 'An unknown error occurred', []));
    }
  }
}
