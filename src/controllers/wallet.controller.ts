import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import { MESSAGES, apiResponse } from '../utils';
import { appEventEmitter } from '../services';
import { hashPassword, CustomError, ErrorMiddleware } from '../middlewares';
import { AppDataSource, Transaction, User, Wallet } from '../database';
import { ChangeTrnxPinDto, SetupTrnxPinDto } from './dto';

export class WalletController {
  private walletRepo: Repository<Wallet>;
  private transactionRepo: Repository<Transaction>;

  constructor() {
    this.walletRepo = AppDataSource.getRepository(Wallet);
    this.transactionRepo = AppDataSource.getRepository(Transaction);
  }

  setupTrnxPin = async (
    req: Request<null, null, SetupTrnxPinDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { pin, confirmPin } = req.body;
    const user = req.user;

    try {
      const wallet = await this.walletRepo.findOne({
        where: { user: new User({ id: user.id }) },
      });

      if (!wallet) {
        throw new CustomError(
          'No wallet associated with this account.',
          StatusCodes.FORBIDDEN,
        );
      }

      if (wallet.txPin) {
        throw new CustomError('Pin already setup.', StatusCodes.BAD_REQUEST);
      }

      if (pin != confirmPin) {
        throw new CustomError(
          MESSAGES.CONFIRM_PASSWORD_ERROR,
          StatusCodes.NOT_ACCEPTABLE,
        );
      }

      const pinHash = await hashPassword(pin);

      wallet.txPin = pinHash;
      await this.walletRepo.save(wallet);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  changeTrnxPin = async (
    req: Request<null, null, ChangeTrnxPinDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { oldPin, newPin, confirmNewPin } = req.body;
    const user = req.user;

    try {
      const wallet = await this.walletRepo.findOne({
        where: { user: new User({ id: user.id }) },
      });

      if (!wallet) {
        throw new CustomError(
          'No wallet associated with this account.',
          StatusCodes.FORBIDDEN,
        );
      }

      if (wallet.txPin && wallet.txPin.length) {
        const correctTrnxPin = await bcrypt.compare(oldPin, wallet.txPin);
        if (!correctTrnxPin) {
          throw new CustomError(
            'Current transaction pin incorrect.',
            StatusCodes.NOT_ACCEPTABLE,
          );
        }

        if (newPin != confirmNewPin) {
          throw new CustomError(
            MESSAGES.CONFIRM_PIN_ERROR,
            StatusCodes.NOT_ACCEPTABLE,
          );
        }

        const pinHash = await hashPassword(newPin);

        wallet.txPin = pinHash;
        await this.walletRepo.save(wallet);

        return res
          .status(StatusCodes.OK)
          .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
      }

      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(apiResponse('error', 'Cannot perform this operation.'));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fetchWalletTransactions = async (
    req: Request<null, null, null, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const user = req.user;

    try {
      const transactions = await this.transactionRepo.find({
        where: [
          { destinationWallet: new Wallet({ id: user.wallet.id }) },
          { sourceWallet: new Wallet({ id: user.wallet.id }) },
        ],
        relations: ['beneficiary', 'destinationWallet'],
      });

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, transactions));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  fetchPayouts = async () => {};
}
