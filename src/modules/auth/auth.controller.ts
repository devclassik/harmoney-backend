import {
  AppDataSource,
  AppFeatures,
  Department,
  Employee,
  Organization,
  Role,
  User,
  UserRoles,
} from '../../database';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IsNull, Not, Repository } from 'typeorm';
import {
  MESSAGES,
  apiResponse,
  generateRandomString,
  generateUniqueId,
  makeUserPublicView,
} from '../../utils';
import {
  sendNewUserVerificationMail,
  sendPasswordResetMail,
} from '../../services';
import bcrypt from 'bcrypt';
import {
  createToken,
  hashPassword,
  CustomError,
  ErrorMiddleware,
} from '../../middlewares';
import {
  RegisterDto,
  VerifyPasswordResetOtpDto,
  LoginDto,
  CreateNewPasswordDto,
} from './auth.dto';

export class AuthController {
  private userRepo: Repository<User>;
  private employeeRepo: Repository<Employee>;
  private roleRepo: Repository<Role>;
  private deptRepo: Repository<Department>;
  private orgRepo: Repository<Organization>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
    this.employeeRepo = AppDataSource.getRepository(Employee);
    this.roleRepo = AppDataSource.getRepository(Role);
    this.deptRepo = AppDataSource.getRepository(Department);
    this.orgRepo = AppDataSource.getRepository(Organization);
  }

  register = async (
    req: Request<null, null, RegisterDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { firstName, lastName, email, password, roleId } = req.body;

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

      const userCount = await this.userRepo.count();
      const isFirstUser = userCount === 0;

      let role;

      if (isFirstUser) {
        role = await this.roleRepo.findOne({
          where: { name: UserRoles.ADMIN },
        });

      } else {
        if (!roleId) {
          throw new CustomError(
            'Role is required for registration',
            StatusCodes.BAD_REQUEST,
          );
        }
      };

      role = await this.roleRepo.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new CustomError(
          'Invalid role specified',
          StatusCodes.BAD_REQUEST,
        );
      }

      const pwdHash = await hashPassword(password);
      const verifyEmailOTP = await generateRandomString(6, '0');

      let user = this.userRepo.create({
        email,
        password: pwdHash,
        verifyEmailOTP,
        role,
      });

      const employee = this.employeeRepo.create({
        firstName,
        lastName,
        employeeId: generateUniqueId(AppFeatures.EMPLOYEE),
      });

      await this.userRepo.manager.transaction(async (manager) => {
        await manager.save(employee);
        user.employee = employee;

        await manager.save(user);
      });

      await sendNewUserVerificationMail(email, verifyEmailOTP);
      return res
        .status(StatusCodes.CREATED)
        .json(
          apiResponse(
            'success',
            MESSAGES.OPS_SUCCESSFUL,
            makeUserPublicView(user),
          ),
        );
    } catch (error) {
      console.log(error);

      ErrorMiddleware.handleError(error, req, res);
    }
  };

  resendVerifyEmailOTP = async (
    req: Request<null, null, RegisterDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const isRegistered = req.path.includes('register');

    if (!isRegistered) {
      return this.initPasswordReset(req, res);
    }

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

      const otp = await generateRandomString(6, '0');
      user.verifyEmailOTP = otp;
      await this.userRepo.save(user);
      await sendNewUserVerificationMail(email, otp);

      return res
        .status(StatusCodes.OK)
        .json(apiResponse('success', MESSAGES.EMAIL_TOKEN_SENT(email)));
    } catch (error) {
      ErrorMiddleware.handleError(error, req, res);
    }
  };

  verifyRegisterOtp = async (
    req: Request<null, null, VerifyPasswordResetOtpDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { otp, email } = req.body;

    try {
      const user = await this.userRepo.findOne({
        where: { email },
        relations: ['employee', 'role', 'role.permissions'],
      });

      if (!user) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('User'),
          StatusCodes.BAD_REQUEST,
        );
      }
      if (user.verifyEmailOTP != otp) {
        throw new CustomError('Invalid otp', StatusCodes.BAD_REQUEST);
      }
      if (user.isEmailVerified) {
        throw new CustomError(
          'Email already verified',
          StatusCodes.BAD_REQUEST,
        );
      }

      const token = createToken({
        id: user.id,
        email: user.email,
        rememberMe: false,
      });

      const org = await this.orgRepo.findOne({
        where: { headDepartment: Not(IsNull()) },
        relations: ['headDepartment', 'headDepartment.hod'],
      });

      user.isEmailVerified = true;
      const department = org?.headDepartment;

      if (!department?.hod) {
        department.hod = user.employee;
      }
      department.members = [
        ...(department.members?.length ? department.members : []),
        user.employee,
      ];

      await this.userRepo.manager.transaction(async (manager) => {
        await manager.save(department);
        await manager.save(user);
      });

      return res.status(StatusCodes.OK).json(
        apiResponse('success', MESSAGES.VERIFICATION_SUCCESSFUL, {
          user,
          token,
        }),
      );
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
        relations: [
          'employee',
          'employee.departments',
          'role',
          'role.permissions',
        ],
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
                ...(user.isEmailVerified && { token }),
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

  initPasswordReset = async (
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

      user.passwordResetOTP = await generateRandomString(6, '0');
      await this.userRepo.save(user);

      await sendPasswordResetMail(user.email, user.passwordResetOTP);

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
        where: { email },
      });

      if (!user) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('User'),
          StatusCodes.BAD_REQUEST,
        );
      }

      if (user.passwordResetOTP !== otp) {
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
    req: Request<null, null, CreateNewPasswordDto, null>,
    res: Response,
  ): Promise<Response | void> => {
    const { email, otp, newPassword, confirmPassword } = req.body;
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

      if (user.passwordResetOTP !== otp) {
        throw new CustomError(MESSAGES.INVALID_OTP, StatusCodes.BAD_REQUEST);
      }

      if (confirmPassword != newPassword) {
        throw new CustomError(
          MESSAGES.CONFIRM_PASSWORD_ERROR,
          StatusCodes.BAD_REQUEST,
        );
      }

      const pwdHash = await hashPassword(newPassword);

      user.passwordResetOTP = null;
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
