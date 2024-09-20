import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import { MESSAGES, apiResponse, makeUserPublicView } from '../utils';
import {
  FileManager,
  appEventEmitter,
  sendUserAccountDeletedMail,
} from '../services';
import { hashPassword, CustomError, ErrorMiddleware } from '../middlewares';
import { AppDataSource, User, Wallet } from '../database';
import { ChangePasswordDto, UpdateProfileDto } from './dto';

export class UserController {
  private userRepo: Repository<User>;
  private walletRepo: Repository<Wallet>;
  private fileManager: FileManager;

  constructor() {
    this.fileManager = new FileManager();
    this.userRepo = AppDataSource.getRepository(User);
    this.walletRepo = AppDataSource.getRepository(Wallet);
  }

  getUser = async (
    req: Request<null, null, null, null>,
    res: Response,
  ): Promise<Response | void> => {
    try {
      const user = await this.userRepo.findOne({
        where: { email: res.locals.user.email },
        relations: ['wallet', 'business'],
      });

      if (!user) {
        throw new CustomError('User not found.', StatusCodes.BAD_REQUEST);
      }

      return res.status(StatusCodes.OK).json(
        apiResponse('success', MESSAGES.OPS_SUCCESSFUL, {
          ...makeUserPublicView(user),
        }),
      );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  updateUser = async (
    req: Request<null, null, UpdateProfileDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { first_name, last_name, phone_no, username } = req.body;
    const files = req.files?.avatar;

    try {
      const user = await this.userRepo.findOne({
        where: { email: res.locals.user.email },
      });

      if (!user) {
        throw new CustomError('User not found.', StatusCodes.BAD_REQUEST);
      }

      const avatarUrl = files
        ? await this.fileManager.uploadFile(files)
        : user.avatarUrl;

      await this.userRepo.save(
        new User({
          id: user.id,
          first_name,
          last_name,
          phone_no,
          username,
          avatarUrl: avatarUrl as string,
        }),
      );

      const updatedUser = await this.userRepo.findOne({
        where: { id: user.id },
      });

      return res.status(StatusCodes.OK).json(
        apiResponse('success', MESSAGES.OPS_SUCCESSFUL, {
          ...makeUserPublicView(updatedUser),
        }),
      );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  changePassword = async (
    req: Request<null, null, ChangePasswordDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    try {
      const user = await this.userRepo.findOne({
        where: { email: res.locals.user.email },
      });

      if (!user) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('User'),
          StatusCodes.BAD_REQUEST,
        );
      }

      if (user.password && user.password.length) {
        const correctPassword = await bcrypt.compare(
          oldPassword,
          user.password,
        );
        if (!correctPassword) {
          throw new CustomError(
            'Incorrect old password.',
            StatusCodes.NOT_ACCEPTABLE,
          );
        }

        if (confirmNewPassword != newPassword) {
          throw new CustomError(
            MESSAGES.CONFIRM_PASSWORD_ERROR,
            StatusCodes.NOT_ACCEPTABLE,
          );
        }

        const pwdHash = await hashPassword(newPassword);

        user.password = pwdHash;
        await this.userRepo.save(user);

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

  deleteAccount = async (
    req: Request<null, null, { password: string }, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { password } = req.body;
    try {
      const user = await this.userRepo.findOne({
        where: { email: res.locals.user.email },
      });

      if (!user) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('User'),
          StatusCodes.BAD_REQUEST,
        );
      }

      if (user.password && user.password.length) {
        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
          throw new CustomError(
            'Incorrect password.',
            StatusCodes.NOT_ACCEPTABLE,
          );
        }

        // soft-delete wallet
        await this.walletRepo.softDelete({
          user: new User({ id: user.id }),
        });

        await this.userRepo.softDelete(user);

        await sendUserAccountDeletedMail(res.locals.user.email);

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
}
