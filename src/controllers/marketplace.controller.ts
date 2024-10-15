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
  sendDebitAlertMail,
} from '../services';
import { CustomError, ErrorMiddleware } from '../middlewares';
import {
  ActivationStatus,
  AppDataSource,
  BusinessCategories,
  MerchantBusiness,
  MerchantService,
  Order,
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
  MerchantPurchaseDto,
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
  private orderRepo: Repository<Order>;

  constructor() {
    this.gateway = new SafeHaven();
    this.businessRepo = AppDataSource.getRepository(MerchantBusiness);
    this.serviceRepo = AppDataSource.getRepository(MerchantService);
    this.vasRepo = AppDataSource.getRepository(SafeHavenService);
    this.transactionRepo = AppDataSource.getRepository(Transaction);
    this.orderRepo = AppDataSource.getRepository(Order);
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
      const tx_ref = await generateRandomString(30, '0');
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
        debitAccountNumber: wallet.accountNumber,
      });

      if (result.statusCode == 200) {
        await deductMainBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.SUCCESSFUL,
          sourceRefId: result.data?.reference,
          description: `${result.data?.receiver?.distribution} ${result.data?.receiver?.vendType} purchase`,
        });

        if (user.allowEmailNotification) {
          const name =
            user?.business?.name ?? `${user.first_name} ${user.last_name}`;

          await sendDebitAlertMail(user.email, name, amount, trnx.description);
        }

        if (user.allowPushNotification) {
          // send inApp notification
        }
      } else {
        await incrementBookBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.FAILED,
          sourceRefId: result.data?.tx_ref,
          currentWalletBalance: wallet.mainBalance + amount,
          previousWalletBalance: wallet.mainBalance,
        });

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(apiResponse('error', MESSAGES.OPS_FAILED, trnx || {}));
      }

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
      wallet: Wallet;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, phoneNumber, amount, bundleCode } = req.body;
    const user = req.user;
    const wallet = req.wallet;

    try {
      const tx_ref = await generateRandomString(30, '0');
      await deductBookBalance(wallet, amount);

      let trnx = await this.transactionRepo.save(
        new Transaction({
          reference: tx_ref,
          amount,
          currentWalletBalance: wallet.mainBalance - amount,
          previousWalletBalance: wallet.mainBalance,
          fee: config.charges.bills,
          description: `Data purchase`,
          type: TransactionType.DEBIT,
          category: TransactionCategory.DATA,
          customer: phoneNumber,
          sourceWallet: new Wallet({ id: wallet.id }),
          bundle: bundleCode,
        }),
      );

      const result = await this.gateway.dataPurchase({
        serviceCategoryId: serviceId,
        amount,
        phoneNumber,
        bundleCode,
        debitAccountNumber: wallet.accountNumber,
      });

      if (result.statusCode == 200) {
        await deductMainBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.SUCCESSFUL,
          sourceRefId: result.data?.reference,
          description: `${result.data?.receiver?.distribution} ${result.data?.receiver?.vendType} purchase`,
        });

        if (user.allowEmailNotification) {
          const name =
            user?.business?.name ?? `${user.first_name} ${user.last_name}`;

          await sendDebitAlertMail(user.email, name, amount, trnx.description);
        }

        if (user.allowPushNotification) {
          // send inApp notification
        }
      } else {
        await incrementBookBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.FAILED,
          sourceRefId: result.data?.tx_ref,
          currentWalletBalance: wallet.mainBalance + amount,
          previousWalletBalance: wallet.mainBalance,
        });

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(apiResponse('error', MESSAGES.OPS_FAILED, trnx || {}));
      }

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, trnx || {}));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  purchaseCabletv = async (
    req: Request<null, null, CablePurchaseDto, null> & {
      user: User;
      wallet: Wallet;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, cardNumber, amount, bundleCode } = req.body;
    const user = req.user;
    const wallet = req.wallet;

    try {
      const tx_ref = await generateRandomString(30, '0');
      await deductBookBalance(wallet, amount);

      let trnx = await this.transactionRepo.save(
        new Transaction({
          reference: tx_ref,
          amount,
          currentWalletBalance: wallet.mainBalance - amount,
          previousWalletBalance: wallet.mainBalance,
          fee: config.charges.bills,
          description: `Cable TV purchase`,
          type: TransactionType.DEBIT,
          category: TransactionCategory.CABLE_TV,
          customer: cardNumber,
          sourceWallet: new Wallet({ id: wallet.id }),
          bundle: bundleCode,
        }),
      );

      const result = await this.gateway.cablePurchase({
        serviceCategoryId: serviceId,
        amount,
        cardNumber,
        bundleCode,
      });

      if (result.statusCode == 200) {
        await deductMainBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.SUCCESSFUL,
          sourceRefId: result.data?.reference,
          description: `${result.data?.receiver?.distribution} purchase`,
        });

        if (user.allowEmailNotification) {
          const name =
            user?.business?.name ?? `${user.first_name} ${user.last_name}`;

          await sendDebitAlertMail(user.email, name, amount, trnx.description);
        }

        if (user.allowPushNotification) {
          // send inApp notification
        }
      } else {
        await incrementBookBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.FAILED,
          sourceRefId: result.data?.tx_ref,
          currentWalletBalance: wallet.mainBalance + amount,
          previousWalletBalance: wallet.mainBalance,
        });

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(apiResponse('error', MESSAGES.OPS_FAILED, trnx || {}));
      }

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, trnx || {}));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  purchaseUtility = async (
    req: Request<null, null, UtilityPurchaseDto, null> & {
      user: User;
      wallet: Wallet;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { serviceId, meterNumber, amount, vendType } = req.body;
    const user = req.user;
    const wallet = req.wallet;

    try {
      const tx_ref = await generateRandomString(30, '0');
      await deductBookBalance(wallet, amount);

      let trnx = await this.transactionRepo.save(
        new Transaction({
          reference: tx_ref,
          amount,
          currentWalletBalance: wallet.mainBalance - amount,
          previousWalletBalance: wallet.mainBalance,
          fee: config.charges.bills,
          description: `Electricity purchase`,
          type: TransactionType.DEBIT,
          category: TransactionCategory.ELECTRICITY,
          customer: meterNumber,
          sourceWallet: new Wallet({ id: wallet.id }),
        }),
      );

      const result = await this.gateway.utilityPurchase({
        serviceCategoryId: serviceId,
        amount,
        meterNumber,
        vendType,
      });

      if (result.statusCode == 200) {
        await deductMainBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.SUCCESSFUL,
          sourceRefId: result.data?.reference,
          description: `${result.data?.receiver?.distribution} ${result.data?.receiver?.vendType} purchase`,
        });

        if (user.allowEmailNotification) {
          const name =
            user?.business?.name ?? `${user.first_name} ${user.last_name}`;

          await sendDebitAlertMail(user.email, name, amount, trnx.description);
        }

        if (user.allowPushNotification) {
          // send inApp notification
        }
      } else {
        await incrementBookBalance(wallet, amount);
        trnx = await this.transactionRepo.save({
          ...trnx,
          status: TransactionStatus.FAILED,
          sourceRefId: result.data?.tx_ref,
          currentWalletBalance: wallet.mainBalance + amount,
          previousWalletBalance: wallet.mainBalance,
        });

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(apiResponse('error', MESSAGES.OPS_FAILED, trnx || {}));
      }

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, trnx || {}));
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
        .json(apiResponse('error', MESSAGES.OPS_FAILED));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  purchaseMerchantService = async (
    req: Request<null, null, MerchantPurchaseDto, null> & {
      user: User;
      wallet: Wallet;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { businessId, amount, note, payerId, serviceId, subServiceId } =
      req.body;
    const user = req.user;
    const wallet = req.wallet;
    let payment = {};

    try {
      const business = await this.businessRepo.findOne({
        where: { id: businessId },
        relations: ['merchant', 'merchant.wallet'],
      });

      if (!business) {
        throw new CustomError(
          MESSAGES.INVALID_RESOURCE('merchant'),
          StatusCodes.NOT_ACCEPTABLE,
        );
      }

      const pay = async (
        senderWallet: Wallet,
        destinationWallet: Wallet,
        amount: number,
        category: TransactionCategory,
      ) => {
        // const nameEnquiry = await this.gateway.getAccountDetails({
        //   accountNumber: destinationWallet.accountNumber,
        //   bankCode: destinationWallet.bankCode,
        // });

        // if (nameEnquiry?.data?.accountName) {
        // const {
        //   accountNumber: destinationAcctNum,
        //   sessionId: nameEnquirySessionId,
        //   bankCode: destinationBankCode,
        // } = nameEnquiry.data;

        const tx_ref = await generateRandomString(30, '0');
        const order_ref = await generateRandomString(8, '0');

        await deductBookBalance(senderWallet, amount); // source
        await incrementBookBalance(destinationWallet, amount); // destination

        const order = await this.orderRepo.save(
          new Order({
            reference: order_ref,
            amount,
            note,
            customerName: user.first_name,
            customer: new User({ id: user.id }),
            business: new MerchantBusiness({ id: business.id }),
          }),
        );

        let senderTrnx = await this.transactionRepo.save(
          new Transaction({
            reference: tx_ref,
            amount,
            currentWalletBalance: senderWallet.mainBalance - amount,
            previousWalletBalance: senderWallet.mainBalance,
            description: `${business.category.toLowerCase()} purchase`,
            type: TransactionType.DEBIT,
            category,
            customer: payerId ?? user.phone_no,
            sourceWallet: new Wallet({ id: senderWallet.id }),
            destinationWallet: new Wallet({ id: destinationWallet.id }),
            order: new Order({ id: order.id }),
          }),
        );

        // const gatewayTransfer = await this.gateway.transferFund({
        //   nameEnquiryReference: nameEnquirySessionId,
        //   debitAccountNumber: senderWallet.accountNumber,
        //   beneficiaryBankCode: destinationBankCode,
        //   beneficiaryAccountNumber: destinationAcctNum,
        //   amount,
        //   saveBeneficiary: false,
        //   narration: `${business.category.toLowerCase()} order`,
        //   paymentReference: tx_ref,
        // });

        //   if (gatewayTransfer.statusCode == 200) {
        //   }
        // }

        return senderTrnx;
      };

      if (business.category == BusinessCategories.WATER) {
        payment = await pay(
          wallet,
          business.merchant.wallet,
          amount,
          TransactionCategory.WATER,
        );
      }

      return res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, payment));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
