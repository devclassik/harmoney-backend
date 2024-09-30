import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse } from '../utils';
import { FileManager, SafeHaven, appEventEmitter } from '../services';
import { CustomError, ErrorMiddleware } from '../middlewares';
import {
  AppDataSource,
  MerchantBusiness,
  MerchantService,
  User,
} from '../database';
import {
  CreateServiceDto,
  UpdateBusinessBankDetailsDto,
  UpdateBusinessProfileDto,
  UpdateServiceDto,
} from './dto';

export class BusinessController {
  private gateway: SafeHaven;
  private fileManager: FileManager;
  private businessRepo: Repository<MerchantBusiness>;
  private serviceRepo: Repository<MerchantService>;

  constructor() {
    this.gateway = new SafeHaven();
    this.fileManager = new FileManager();
    this.businessRepo = AppDataSource.getRepository(MerchantBusiness);
    this.serviceRepo = AppDataSource.getRepository(MerchantService);
  }

  updateBusinessProfile = async (
    req: Request<null, null, UpdateBusinessProfileDto, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { business_name, category, address } = req.body;
    const business = req.business;

    try {
      await this.businessRepo.save(
        new MerchantBusiness({
          id: business.id,
          name: business_name,
          category,
          address,
        }),
      );

      const updatedBusiness = await this.businessRepo.findOne({
        where: { id: business.id },
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, updatedBusiness));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  updateBusinessBank = async (
    req: Request<null, null, UpdateBusinessBankDetailsDto, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { accountNumber, bankCode, bankName } = req.body;
    const business = req.business;

    try {
      const bankRes = await this.gateway.getAccountDetails({
        accountNumber,
        bankCode,
      });

      if (bankRes?.data?.accountName) {
        await this.businessRepo.save(
          new MerchantBusiness({
            id: business.id,
            accountName: bankRes.data.accountName,
            accountNumber: bankRes.data.accountNumber,
            bankCode: bankRes.data.bankCode,
            bankName,
          }),
        );

        const updatedBusiness = await this.businessRepo.findOne({
          where: { id: business.id },
        });

        return res
          .status(StatusCodes.OK)
          .json(
            apiResponse('success', MESSAGES.OPS_SUCCESSFUL, updatedBusiness),
          );
      }

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(apiResponse('error', MESSAGES.INVALID_RESOURCE('Account'), {}));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  createService = async (
    req: Request<null, null, CreateServiceDto, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { name, isFixedAmount, amount, imageUrl } = req.body;
    const business = req.business;

    try {
      const service = await this.serviceRepo.save(
        new MerchantService({
          business: new MerchantBusiness({ id: business.id }),
          name,
          amount,
          isFixedAmount,
          imageUrl,
        }),
      );

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, service));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fetchServices = async (
    req: Request<null, null, null, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const business = req.business;

    try {
      const services = await this.serviceRepo.find({
        where: { business: new MerchantBusiness({ id: business.id }) },
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, services));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  updateService = async (
    req: Request<null, null, UpdateServiceDto, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, name, isFixedAmount, amount, imageUrl } = req.body;
    const business = req.business;

    try {
      let service = await this.serviceRepo.findOne({
        where: {
          id: serviceId,
          business: new MerchantBusiness({ id: business.id }),
        },
      });

      if (!service) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Service'),
          StatusCodes.BAD_REQUEST,
        );
      }

      service = await this.serviceRepo.save(
        new MerchantService({
          id: service.id,
          business: new MerchantBusiness({ id: business.id }),
          name,
          amount,
          isFixedAmount,
          imageUrl,
        }),
      );

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, service));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  deleteService = async (
    req: Request<null, null, { serviceId: number }, null> & {
      user: User;
      business: MerchantBusiness;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId } = req.body;
    const business = req.business;

    try {
      const service = await this.serviceRepo.findOne({
        where: {
          id: serviceId,
          business: new MerchantBusiness({ id: business.id }),
        },
      });

      if (!service) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Service'),
          StatusCodes.BAD_REQUEST,
        );
      }

      await this.serviceRepo.softDelete(new MerchantService({ id: serviceId }));

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
