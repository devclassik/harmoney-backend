import { Not, Repository } from 'typeorm';
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
import {
  AppDataSource,
  MerchantBusiness,
  User,
  UserIdentity,
  Wallet,
} from '../database';
import { ChangePasswordDto, InitIdentityDto, UpdateProfileDto } from './dto';

export class UserController {
  private userRepo: Repository<User>;
  private walletRepo: Repository<Wallet>;
  private identityRepo: Repository<UserIdentity>;
  private businessRepo: Repository<MerchantBusiness>;
  private fileManager: FileManager;

  constructor() {
    this.fileManager = new FileManager();
    this.userRepo = AppDataSource.getRepository(User);
    this.walletRepo = AppDataSource.getRepository(Wallet);
    this.identityRepo = AppDataSource.getRepository(UserIdentity);
    this.businessRepo = AppDataSource.getRepository(MerchantBusiness);
  }

  getUser = async (
    req: Request<null, null, null, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    try {
      const user = await this.userRepo.findOne({
        where: { email: req.user.email },
        relations: ['wallet', 'business', 'identities'],
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
    req: Request<null, null, UpdateProfileDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { first_name, last_name, phone_no, username } = req.body;
    const user = req.user;
    const files = req.files?.avatar;

    try {
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
    req: Request<null, null, ChangePasswordDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.user;
    try {
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
    req: Request<null, null, { password: string }, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { password } = req.body;
    const user = req.user;
    try {
      if (user.password && user.password.length) {
        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
          throw new CustomError(
            'Incorrect password.',
            StatusCodes.NOT_ACCEPTABLE,
          );
        }

        await this.walletRepo.softDelete({
          user: new User({ id: user.id }),
        });

        await this.identityRepo.softDelete({
          user: new User({ id: user.id }),
        });

        await this.businessRepo.softDelete({
          merchant: new User({ id: user.id }),
        });

        await this.userRepo.softDelete(user);

        await sendUserAccountDeletedMail(user.email);

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

  initiateIdentityVerification = async (
    req: Request<null, null, InitIdentityDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { identityType, identityNumber } = req.body;
    const user = req.user;

    try {
      // const identityExist = await this.identityRepo.findOne({
      //   where: {
      //     number: identityNumber,
      //     type: identityType,
      //     user: Not(new User({ id: user.id })),
      //   },
      // });

      // if (identityExist) {
      //   throw new CustomError(
      //     'This Identity is used y another user.',
      //     StatusCodes.NOT_ACCEPTABLE,
      //   );
      // }

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, {}));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
