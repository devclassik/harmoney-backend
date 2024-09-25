import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse } from '../utils';
import { appEventEmitter } from '../services';
import { ErrorMiddleware } from '../middlewares';
import { AppDataSource, MerchantBusiness, User } from '../database';
import { BankDetailsDto } from './dto';
import { SafeHaven } from '../services';

export class PaymentController {
  private gateway: SafeHaven;
  constructor() {
    this.gateway = new SafeHaven();
  }

  fetchBankList = async (
    req: Request<null, null, null, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;

    try {
      const result = await this.gateway.getAllBanks();

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fetchAccountDetails = async (
    req: Request<null, null, BankDetailsDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { accountNumber, bankCode } = req.body;
    const user = req.user;

    try {
      const result = await this.gateway.getAccountDetails({
        accountNumber,
        bankCode,
      });

      if (result?.data?.accountName) {
        const data = {
          accountNumber: result.data.accountNumber,
          accountName: result.data.accountName,
          bankCode: result.data.bankCode,
        };

        return res
          .status(StatusCodes.OK)
          .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, data));
      }

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          apiResponse('error', MESSAGES.INVALID_RESOURCE('Account'), {}),
        );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
