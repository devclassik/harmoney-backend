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
  SafeHavenService,
  User,
} from '../database';
import { FetchProviderServicesDto } from './dto';

export class MarketplaceController {
  private gateway: SafeHaven;
  private businessRepo: Repository<MerchantBusiness>;
  private serviceRepo: Repository<MerchantService>;
  private vasRepo: Repository<SafeHavenService>;

  constructor() {
    this.gateway = new SafeHaven();
    this.businessRepo = AppDataSource.getRepository(MerchantBusiness);
    this.serviceRepo = AppDataSource.getRepository(MerchantService);
    this.vasRepo = AppDataSource.getRepository(SafeHavenService);
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

  getVasItems = async (
    req: Request<{ vasIdentifier: string }, null, null, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { vasIdentifier } = req.params;

    try {
      const service = await this.vasRepo.findOne({
        where: { identifier: vasIdentifier },
      });

      if (!service) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND(vasIdentifier),
          StatusCodes.FORBIDDEN,
        );
      }

      const result = await this.gateway.getVasCategories(service.serviceId);

      const data = result.data.map((item) => {
        return {
          serviceId: item._id,
          name: item.name,
          description: item.description,
          logoUrl: item.logoUrl,
        };
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, data));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fetchVasItemPlans = async (
    req: Request<{ serviceId: string }, null, null, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId } = req.params;
    const user = req.user;

    try {
      const result = await this.gateway.getCategoryProducts(serviceId);

      return res
        .status(StatusCodes.OK)
        .json(
          apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data || []),
        );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  verifyPowerOrCableTvData = async (
    req: Request<
      null,
      null,
      { serviceId: string; meterOrCardNumber: string },
      null
    > & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, meterOrCardNumber } = req.body;
    const user = req.user;

    try {
      const result = await this.gateway.verifyPowerOrCableInfo(
        serviceId,
        meterOrCardNumber,
      );

      return res
        .status(StatusCodes.OK)
        .json(
          apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data || {}),
        );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
