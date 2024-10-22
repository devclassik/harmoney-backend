import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse } from '../utils';
import { appEventEmitter } from '../services';
import { CustomError, ErrorMiddleware } from '../middlewares';
import { AppDataSource, MerchantBusiness, Order, User } from '../database';
import { UpdateOrderStatusDto } from './dto/order.dto';

export class OrderController {
  private orderRepo: Repository<Order>;

  constructor() {
    this.orderRepo = AppDataSource.getRepository(Order);
  }

  fetchOrders = async (
    req: Request<null, null, null, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;

    try {
      const orders = await this.orderRepo.find({
        where: { business: new MerchantBusiness({ id: user.business.id }) },
        relations: ['transactions'],
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, orders));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  updateOrderStatus = async (
    req: Request<null, null, UpdateOrderStatusDto, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;
    const { orderId, action } = req.body;

    try {
      const order = await this.orderRepo.findOne({
        where: {
          id: orderId,
          business: new MerchantBusiness({ id: user.business.id }),
        },
        relations: ['transaction'],
      });

      if (!order) {
        throw new CustomError(
          MESSAGES.INVALID_RESOURCE('order'),
          StatusCodes.NOT_ACCEPTABLE,
        );
      }

      order.status = action;
      await this.orderRepo.save(order);

      // todo: if accepted, move money from holding account to merchant account
      // todo: if rejected, move money from holding account to customer account

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, order));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
