import { Not, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import { MESSAGES, apiResponse, logger, makeUserPublicView } from '../utils';
import {
  FileManager,
  SafeHaven,
  appEventEmitter,
  sendUserAccountDeletedMail,
} from '../services';
import { hashPassword, CustomError, ErrorMiddleware } from '../middlewares';
import {
  AppDataSource,
  IdentityTypes,
  MerchantBusiness,
  NubanProvider,
  User,
  UserIdentity,
  Wallet,
} from '../database';
import {
  ChangePasswordDto,
  FinalizeIdentityDto,
  InitIdentityDto,
  UpdateNotificationDto,
  UpdateProfileDto,
} from './dto';
import config from '../config';

export class UserController {
  private gateway: SafeHaven;
  private fileManager: FileManager;
  private userRepo: Repository<User>;
  private walletRepo: Repository<Wallet>;
  private identityRepo: Repository<UserIdentity>;
  private businessRepo: Repository<MerchantBusiness>;

  constructor() {
    this.gateway = new SafeHaven();
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
    let user = req.user;
    try {
      user = await this.userRepo.findOne({
        where: { email: user.email },
        relations: ['wallet', 'business', 'identities'],
      });

      if (!user) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('User'),
          StatusCodes.BAD_REQUEST,
        );
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

    try {
      await this.userRepo.save(
        new User({
          id: user.id,
          first_name,
          last_name,
          phone_no,
          username,
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

  uploadPhoto = async (
    req: Request<
      null,
      null,
      { target: 'USER' | 'BUSINESS' | 'SERVICE' },
      null
    > & {
      user: User;
    },
    res: Response,
  ): Promise<Response | void> => {
    const { target } = req.body;
    const user = req.user;
    const files = req.files?.photo;
    try {
      if (!files) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('File'),
          StatusCodes.NOT_ACCEPTABLE,
        );
      }
      const imageUrl = await this.fileManager.uploadFile(files);

      if (target == 'BUSINESS') {
        const business = await this.businessRepo.findOne({
          where: { merchant: new User({ id: user.id }) },
        });

        if (!business) {
          throw new CustomError(
            MESSAGES.RESOURCE_NOT_FOUND('Merchant'),
            StatusCodes.NOT_ACCEPTABLE,
          );
        }

        await this.businessRepo.save(
          new MerchantBusiness({
            id: business.id,
            avatarUrl: imageUrl as string,
          }),
        );
      }

      if (target == 'USER') {
        await this.userRepo.save(
          new User({
            id: user.id,
            avatarUrl: imageUrl as string,
          }),
        );
      }

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL, { imageUrl }));
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
      const identityExist = await this.identityRepo.findOne({
        where: {
          number: identityNumber,
          type: identityType,
          user: Not(user.id),
        },
      });

      if (identityExist) {
        throw new CustomError(
          MESSAGES.DUPLICATE(identityType),
          StatusCodes.NOT_ACCEPTABLE,
        );
      }

      const result = await this.gateway.initiateIdentityCheck({
        type: identityType,
        number: identityNumber,
      });

      if (result.data && result.data.status == 'SUCCESS') {
        const identity = await this.identityRepo.save(
          new UserIdentity({
            type: identityType,
            number: identityNumber,
            validated: false,
            identityId: result.data._id,
            confirmToken: result.data.otpId,
            user,
          }),
        );

        return res.status(StatusCodes.OK).json(
          apiResponse('success', MESSAGES.OPS_SUCCESSFUL, {
            identityId: result.data._id,
            identityType: result.data.type,
            otpVerified: result.data.otpVerified,
            providerResponse: result.data.providerResponse,
          }),
        );
      }

      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .json(
          apiResponse('success', MESSAGES.VERIFICATION_FAILED, result.data),
        );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  finalizeIdentityVerification = async (
    req: Request<null, null, FinalizeIdentityDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { identityId, identityType, otp } = req.body;
    const user = req.user;

    try {
      const identity = await this.identityRepo.findOne({
        where: {
          identityId,
          type: identityType,
          user: new User({ id: user.id }),
        },
      });

      if (!identity) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND(`${identityType} Identity`),
          StatusCodes.NOT_ACCEPTABLE,
        );
      }

      if (identity.validated) {
        throw new CustomError('Already Validated', StatusCodes.NOT_ACCEPTABLE);
      }

      const vResult = await this.gateway.finalizeIdentityCheck({
        type: identity.type,
        identityId: identity.identityId,
        otp,
      });

      if (vResult.data.otpVerified) {
        const wallet = await this.walletRepo.findOne({
          where: { user: new User({ id: user.id }) },
        });

        if (wallet && !wallet.accountNumber) {
          const aResult = await this.gateway.createSubAccount({
            otp,
            phoneNumber: user.phone_no,
            emailAddress: user.email,
            identityId: identity.identityId,
            identityType: identity.type,
            identityNumber: identity.number,
            externalReference: `${user.first_name} ${user.last_name} - ${identity.number}`,
          });

          if (!aResult.data || !aResult.data.accountNumber) {
            throw new CustomError(
              aResult.message ?? 'Failed to provision NUBAN.',
              StatusCodes.NOT_ACCEPTABLE,
            );
          }

          wallet.accountName = aResult.data.accountName;
          wallet.accountNumber = aResult.data.accountNumber;
          wallet.saveHavenAccountId = aResult.data._id;
          wallet.bankCode = config.safehaven.bank_code;
          wallet.bankName = config.safehaven.bank_name;
          wallet.externalReference = aResult.data.externalReference;
          wallet.nubanProvider = NubanProvider.SAFE_HAVEN;

          await this.walletRepo.save(wallet);
        }

        await this.identityRepo.save({ ...identity, validated: true });
        await this.identityRepo.delete({
          user: new User({ id: user.id }),
          type: identityType,
          validated: false,
        });
      }

      return res.status(StatusCodes.OK).json(
        apiResponse('success', MESSAGES.OPS_SUCCESSFUL, {
          identityType: vResult.data.type,
          otpVerified: vResult.data.otpVerified,
          providerResponse: vResult.data.providerResponse,
        }),
      );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  updateNotificationSetting = async (
    req: Request<null, null, UpdateNotificationDto, null> & { user: User },
    res: Response,
  ): Promise<Response | void> => {
    const { email, push } = req.body;
    const user = req.user;
    try {
      await this.userRepo.save(
        new User({
          id: user.id,
          allowEmailNotification: !!email,
          allowPushNotification: !!push,
        }),
      );

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
