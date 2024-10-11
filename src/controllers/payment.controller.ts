import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse, generateRandomString } from '../utils';
import { appEventEmitter, sendCreditAlertMail } from '../services';
import { ErrorMiddleware } from '../middlewares';
import {
  AppDataSource,
  MerchantBusiness,
  Transaction,
  TransactionCategory,
  TransactionType,
  User,
  Wallet,
} from '../database';
import { BankDetailsDto, WebhookDto } from './dto';
import { SafeHaven } from '../services';

export class PaymentController {
  private gateway: SafeHaven;
  private walletRepo: Repository<Wallet>;
  private transactionRepo: Repository<Transaction>;

  constructor() {
    this.gateway = new SafeHaven();
    this.walletRepo = AppDataSource.getRepository(Wallet);
    this.transactionRepo = AppDataSource.getRepository(Transaction);
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
        .json(apiResponse('error', MESSAGES.INVALID_RESOURCE('Account'), {}));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  webhook = async (
    req: Request<null, null, WebhookDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { type, data } = req.body;
    if (type !== 'transfer' || !data) {
      return res.status(StatusCodes.EXPECTATION_FAILED);
    }

    const {
      creditAccountNumber,
      destinationInstitutionCode,
      amount,
      narration,
      debitAccountName,
    } = data;

    try {
      const wallet = await this.walletRepo.findOne({
        where: {
          accountNumber: creditAccountNumber,
          bankCode: destinationInstitutionCode,
        },
        relations: ['user'],
      });

      if (!wallet) {
        return res.status(StatusCodes.EXPECTATION_FAILED);
      }

      const tx_ref = await generateRandomString(30, 'a0');

      const trnx = await this.transactionRepo.save(
        new Transaction({
          reference: tx_ref,
          amount,
          currentWalletBalance: wallet.mainBalance + amount,
          previousWalletBalance: wallet.mainBalance,
          fee: 0.0,
          description: narration,
          type: TransactionType.CREDIT,
        }),
      );

      wallet.mainBalance = wallet.mainBalance + amount;
      wallet.bookBalance = wallet.bookBalance + amount;
      await this.walletRepo.save(wallet);

      if (wallet.user.allowEmailNotification) {
        const name =
          wallet.user?.business?.name ??
          `${wallet.user.first_name} ${wallet.user.last_name}`;

        await sendCreditAlertMail(
          wallet.user.email,
          name,
          debitAccountName,
          amount,
        );
      }

      if (wallet.user.allowPushNotification) {
        // send inApp notification
      }

      return res.status(StatusCodes.OK);
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
