import { CustomError } from '../middlewares';
import { AppDataSource, Wallet } from '../database';
import { MESSAGES } from '../utils';
import { StatusCodes } from 'http-status-codes';

export const deductBookBalance = async (wallet: Wallet, amount: number) => {
  const walletRepo = AppDataSource.getRepository(Wallet);

  if (amount > wallet.bookBalance) {
    throw new CustomError(
      MESSAGES.INSUFFICIENT_BALANCE,
      StatusCodes.NOT_ACCEPTABLE,
    );
  }

  await walletRepo.decrement({ id: wallet.id }, 'bookBalance', amount);

  return true;
};

export const incrementBookBalance = async (wallet: Wallet, amount: number) => {
  const walletRepo = AppDataSource.getRepository(Wallet);

  await walletRepo.increment({ id: wallet.id }, 'mainBalance', amount);

  return true;
};

export const deductMainBalance = async (wallet: Wallet, amount: number) => {
  const walletRepo = AppDataSource.getRepository(Wallet);

  await walletRepo.decrement({ id: wallet.id }, 'mainBalance', amount);

  return true;
};

