import { IsNull, Not, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MESSAGES, apiResponse, generateRandomString } from '../utils';
import { appEventEmitter, sendCreditAlertMail } from '../services';
import { CustomError, ErrorMiddleware } from '../middlewares';
import {
  AppDataSource,
  MerchantBusiness,
  Transaction,
  TransactionCategory,
  TransactionType,
  User,
  Wallet,
} from '../database';
import { BankDetailsDto, FundTransferDto, WebhookDto } from './dto';
import { SafeHaven } from '../services';

export class PaymentController {
  private gateway: SafeHaven;
  private userRepo: Repository<User>;
  private walletRepo: Repository<Wallet>;
  private transactionRepo: Repository<Transaction>;

  constructor() {
    this.gateway = new SafeHaven();
    this.userRepo = AppDataSource.getRepository(User);
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

  getContacts = async (
    req: Request<null, null, null, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;
    try {
      const users = await this.userRepo.find({
        where: {
          username: Not(user.username),
          wallet: { accountNumber: Not(IsNull()) },
        },
        relations: ['wallet'],
        select: {
          first_name: true,
          last_name: true,
          phone_no: true,
          username: true,
          wallet: {
            accountNumber: true,
            accountName: true,
            bankCode: true,
          },
        },
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, users));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fundTransfer = async (
    req: Request<
      { transferType: 'external' | 'internal' | 'others' },
      null,
      FundTransferDto,
      null
    > & { user: User; wallet: Wallet },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;
    const wallet = req.wallet;
    const { transferType } = req.params;
    const { amount, description, accountNumber, bankCode, username, email } =
      req.body;

    try {
      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
