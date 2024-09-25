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

  // fetchBankDetails = async (
  //   req: Request<null, null, BankDetailsDto, null> & { user: User },
  //   res: Response,
  // ): Promise<Response | void> => {
  //   const user = req.user;

  //   try {
  //     const orders = await this.orderRepo.find({
  //       where: { business: new MerchantBusiness({ id: user.business.id }) },
  //       relations: ['transaction'],
  //     });

  //     return res
  //       .status(StatusCodes.OK)
  //       .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, orders));
  //   } catch (error) {
  //     ErrorMiddleware.handleError(error, req, res);
  //   }
  // };
}
