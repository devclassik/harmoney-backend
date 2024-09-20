import {
  AccountType,
  AppDataSource,
  MerchantBusiness,
  User,
  Wallet,
} from '../database';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Repository } from 'typeorm';
import {
  MESSAGES,
  apiResponse,
  forgeUsername,
  generateRandomString,
  makeUserPublicView,
} from '../utils';
import {
  sendNewUserVerificationMail,
  sendPasswordResetMail,
} from '../services';
import bcrypt from 'bcrypt';
import {
  createToken,
  hashPassword,
  CustomError,
  ErrorMiddleware,
} from '../middlewares';
import {
  LoginDto,
  RegisterDto,
  SetNewPasswordDto,
  VerifyPasswordResetOtpDto,
} from './dto';

export class AuthController {
  private userRepo: Repository<User>;
  private walletRepo: Repository<Wallet>;
  private businessRepo: Repository<MerchantBusiness>;
  Wallet;
  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
    this.walletRepo = AppDataSource.getRepository(Wallet);
    this.businessRepo = AppDataSource.getRepository(MerchantBusiness);
  }

  register = async (
    req: Request<null, null, RegisterDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const {
      first_name,
      last_name,
      phone_no,
      email,
      password,
      account_type,
      business_name,
      category,
    } = req.body;

    try {
      let existingUser = await this.userRepo.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new CustomError(
          MESSAGES.EMAIL_ALREADY_USED,
          StatusCodes.BAD_REQUEST,
        );
      }

      const username = await forgeUsername(email);
      const pwdHash = await hashPassword(password);

      const user = await this.userRepo.save(
        new User({
          first_name,
          last_name,
          phone_no,
          email,
          password: pwdHash,
          confirmEmailToken: await generateRandomString(6, '0'),
          username,
          account_type,
        }),
      );

      const wallet = await this.walletRepo.save(
        new Wallet({
          user: new User({ id: user.id }),
        }),
      );
      user.wallet = new Wallet({ id: wallet.id });
      await this.userRepo.save(user);

      if (account_type == AccountType.MERCHANT) {
        const business = await this.businessRepo.save(
          new MerchantBusiness({
            name: business_name,
            category,
            merchant: new User({ id: user.id }),
          }),
        );

        user.business = new MerchantBusiness({ id: business.id });
        await this.userRepo.save(user);
      }

      await sendNewUserVerificationMail(user.email, user.confirmEmailToken);

      const token = createToken({
        id: user.id,
        email: user.email,
        rememberMe: false,
      });

      return res.status(StatusCodes.CREATED).json(
        apiResponse('success', MESSAGES.OPS_SUCCESSFUL, {
          ...makeUserPublicView(user),
          token,
        }),
      );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  resendSignupEmailVerificationOtp = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
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

      user.confirmEmailToken = await generateRandomString(6, '0');
      await this.userRepo.save(user);

      await sendNewUserVerificationMail(user.email, user.confirmEmailToken);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.EMAIL_TOKEN_SENT(user.email)));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  verifySignupOtp = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const { otp } = req.body;
    try {
      const user = await this.userRepo.findOne({
        where: { email: res.locals.user.email },
      });

      if (!user || user.confirmEmailToken != otp) {
        throw new CustomError('Invalid otp', StatusCodes.BAD_REQUEST);
      }

      user.confirmEmailToken = null;
      user.isEmailVerified = true;

      await this.userRepo.save(user);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.VERIFICATION_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  login = async (
    req: Request<null, null, LoginDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { email, password, rememberMe } = req.body;
    try {
      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (user) {
        if (user.password && user.password.length) {
          const pwd = await bcrypt.compare(password, user.password);
          if (pwd) {
            const token = createToken({
              id: user.id,
              email: user.email,
              rememberMe,
            });

            return res.status(StatusCodes.OK).json(
              apiResponse('success', MESSAGES.OPS_SUCCESSFUL, {
                ...makeUserPublicView(user),
                token,
              }),
            );
          }
        }
      }

      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        StatusCodes.BAD_REQUEST,
      );
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  initiatePasswordReset = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const { email } = req.body;

    try {
      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (!user) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('User'),
          StatusCodes.BAD_REQUEST,
        );
      }

      user.passwordResetToken = await generateRandomString(6, '0');
      await this.userRepo.save(user);

      await sendPasswordResetMail(user.email, user.passwordResetToken);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  verifyPasswordResetOtp = async (
    req: Request<null, null, VerifyPasswordResetOtpDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { email, otp } = req.body;
    try {
      const user = await this.userRepo.findOne({
        where: { email, passwordResetToken: otp },
      });

      if (!user) {
        throw new CustomError(MESSAGES.INVALID_OTP, StatusCodes.BAD_REQUEST);
      }

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  finalizePasswordReset = async (
    req: Request<null, null, SetNewPasswordDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { email, otp, password, confirmPassword } = req.body;
    try {
      const user = await this.userRepo.findOne({
        where: { email, passwordResetToken: otp },
      });

      if (!user) {
        throw new CustomError(MESSAGES.INVALID_OTP, StatusCodes.BAD_REQUEST);
      }

      if (confirmPassword != password) {
        throw new CustomError(
          MESSAGES.CONFIRM_PASSWORD_ERROR,
          StatusCodes.BAD_REQUEST,
        );
      }

      const pwdHash = await hashPassword(password);

      user.passwordResetToken = null;
      user.password = pwdHash;

      await this.userRepo.save(user);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.OPS_SUCCESSFUL));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };
}
