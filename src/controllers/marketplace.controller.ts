import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse } from '../utils';
import { SafeHaven, appEventEmitter } from '../services';
import { CustomError, ErrorMiddleware } from '../middlewares';
import {
  ActivationStatus,
  AppDataSource,
  BusinessCategories,
  MerchantBusiness,
  MerchantService,
  User,
} from '../database';
import { FetchProviderServicesDto } from './dto';

export class MarketplaceController {
  private gateway: SafeHaven;
  private businessRepo: Repository<MerchantBusiness>;
  private serviceRepo: Repository<MerchantService>;

  constructor() {
    this.gateway = new SafeHaven();
    this.businessRepo = AppDataSource.getRepository(MerchantBusiness);
    this.serviceRepo = AppDataSource.getRepository(MerchantService);
  }

  fetchProviders = async (
    req: Request<{ category: BusinessCategories }, null, null, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { category } = req.params;

    try {
      const providers = await this.businessRepo.find({
        where: {
          category: category,
          activation_status: ActivationStatus.ACTIVATE,
        },
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, providers));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fetchProviderServices = async (
    req: Request<FetchProviderServicesDto, null, null, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { category, businessId } = req.params;

    try {
      const services = await this.serviceRepo.find({
        where: {
          business: new MerchantBusiness({
            id: businessId,
            category: category,
            activation_status: ActivationStatus.ACTIVATE,
          }),
        },
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, services));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  getVasCategories = async (
    req: Request<{ vasIdentifier: string }, null, null, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { vasIdentifier } = req.params;
    try {
      const result = await this.gateway.getVasCategories(vasIdentifier);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fetchDataPlans = async (
    req: Request<{ provider: string }, null, null, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { provider } = req.params;
    const user = req.user;

    try {
      const result = await this.gateway.getAllVas();

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
