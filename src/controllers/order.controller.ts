import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse } from '../utils';
import { appEventEmitter } from '../services';
import { ErrorMiddleware } from '../middlewares';
import { AppDataSource, MerchantBusiness, Order, User } from '../database';

export class OrderController {
  private orderRepo: Repository<Order>;

  constructor() {
    this.orderRepo = AppDataSource.getRepository(Order);
  }

  fetchOrders = async (
    req: Request<null, null, null, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;

    try {
      const orders = await this.orderRepo.find({
        where: { business: new MerchantBusiness({ id: user.business.id }) },
        relations: ['transaction'],
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, orders));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
