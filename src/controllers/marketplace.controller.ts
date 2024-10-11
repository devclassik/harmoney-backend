import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse, generateRandomString, logger } from '../utils';
import {
  SafeHaven,
  appEventEmitter,
  deductBookBalance,
  deductMainBalance,
  incrementBookBalance,
} from '../services';
import { CustomError, ErrorMiddleware } from '../middlewares';
import {
  ActivationStatus,
  AppDataSource,
  BusinessCategories,
  MerchantBusiness,
  MerchantService,
  SafeHavenService,
  Transaction,
  TransactionCategory,
  TransactionStatus,
  TransactionType,
  User,
  Wallet,
} from '../database';
import {
  AirtimePurchaseDto,
  CablePurchaseDto,
  DataPurchaseDto,
  FetchProviderServicesDto,
  UtilityPurchaseDto,
  VerifyPowerOrCableTvDataDto,
} from './dto';
import config from '../config';

export class MarketplaceController {
  private gateway: SafeHaven;
  private businessRepo: Repository<MerchantBusiness>;
  private serviceRepo: Repository<MerchantService>;
  private vasRepo: Repository<SafeHavenService>;
  private transactionRepo: Repository<Transaction>;

  constructor() {
    this.gateway = new SafeHaven();
    this.businessRepo = AppDataSource.getRepository(MerchantBusiness);
    this.serviceRepo = AppDataSource.getRepository(MerchantService);
    this.vasRepo = AppDataSource.getRepository(SafeHavenService);
    this.transactionRepo = AppDataSource.getRepository(Transaction);
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
    req: Request<null, null, VerifyPowerOrCableTvDataDto, null> & {
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

  purchaseAirtime = async (
    req: Request<null, null, AirtimePurchaseDto, null> & {
      user: User;
      wallet: Wallet;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, phoneNumber, amount } = req.body;
    const user = req.user;
    const wallet = req.wallet;

    try {
      const tx_ref = await generateRandomString(30, 'a0');
      await deductBookBalance(wallet, amount);

      let trnx = await this.transactionRepo.save(
        new Transaction({
          reference: tx_ref,
          amount,
          currentWalletBalance: wallet.mainBalance - amount,
          previousWalletBalance: wallet.mainBalance,
          fee: config.charges.bills,
          description: `Airtime purchase`,
          type: TransactionType.DEBIT,
          category: TransactionCategory.AIRTIME,
          customer: phoneNumber,
          sourceWallet: new Wallet({ id: wallet.id }),
        }),
      );

      const result = await this.gateway.airtimePurchase({
        serviceCategoryId: serviceId,
        amount,
        phoneNumber,
        debitAccountNumber: wallet.accountNumber
      });

      if (result.status == 'successful') {
        await deductMainBalance(wallet, amount);
        trnx = await this.transactionRepo.save(
          new Transaction({
            id: trnx.id,
            status: TransactionStatus.SUCCESSFUL,
            sourceRefId: result.data?.tx_ref,
          }),
        );
      } else {
        await incrementBookBalance(wallet, amount);
        trnx = await this.transactionRepo.save(
          new Transaction({
            id: trnx.id,
            status: TransactionStatus.FAILED,
            sourceRefId: result.data?.tx_ref,
          }),
        );
      }

      logger.info(result.data);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, trnx || {}));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  purchaseData = async (
    req: Request<null, null, DataPurchaseDto, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, phoneNumber, amount, bundleCode } = req.body;
    const user = req.user;

    try {
      //TODO debit user wallet
      const result = await this.gateway.dataPurchase({
        serviceCategoryId: serviceId,
        amount,
        phoneNumber,
        bundleCode,
      });

      return res
        .status(StatusCodes.OK)
        .json(
          apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data || {}),
        );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  purchaseCabletv = async (
    req: Request<null, null, CablePurchaseDto, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, cardNumber, amount, bundleCode } = req.body;
    const user = req.user;

    try {
      //TODO debit user wallet
      const result = await this.gateway.cablePurchase({
        serviceCategoryId: serviceId,
        amount,
        cardNumber,
        bundleCode,
      });

      return res
        .status(StatusCodes.OK)
        .json(
          apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data || {}),
        );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  purchaseUtility = async (
    req: Request<null, null, UtilityPurchaseDto, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, meterNumber, amount, vendType } = req.body;
    const user = req.user;

    try {
      //TODO debit user wallet
      const result = await this.gateway.utilityPurchase({
        serviceCategoryId: serviceId,
        amount,
        meterNumber,
        vendType,
      });

      return res
        .status(StatusCodes.OK)
        .json(
          apiResponse('success', MESSAGES.OPS_SUCCESSFUL, result.data || {}),
        );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  purchaseInternet = async (
    req: Request<null, null, null, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;

    try {
      return res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
