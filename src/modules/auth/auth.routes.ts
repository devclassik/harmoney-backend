import express from 'express';
import { regenerateToken } from '../../middlewares';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import {
  registerSchema,
  loginSchema,
  passwordResetInitiateSchema,
  passwordResetVerifySchema,
  passwordResetFinalizeSchema,
  resendOTPSchema,
  verifyRegisterOTPSchema,
} from './auth.validators';
import { AuthController } from './auth.controller';

export const AuthRoutes = express.Router();

const authController = new AuthController();

AuthRoutes.post(
  '/auth/register',
  validateRequest(registerSchema),
  authController.register,
);

AuthRoutes.post(
  '/auth/login',
  validateRequest(loginSchema),
  authController.login,
);

AuthRoutes.post(
  '/auth/resend-otp/register',
  validateRequest(resendOTPSchema),
  authController.resendVerifyEmailOTP,
);

AuthRoutes.post(
  '/auth/verify-otp/register',
  validateRequest(verifyRegisterOTPSchema),
  authController.verifyRegisterOtp,
);

AuthRoutes.post(
  '/auth/password-reset/initiate',
  validateRequest(passwordResetInitiateSchema),
  authController.initPasswordReset,
);

AuthRoutes.post(
  '/auth/resend-otp/password-reset',
  validateRequest(resendOTPSchema),
  authController.resendVerifyEmailOTP,
);

AuthRoutes.post(
  '/auth/password-reset/verify',
  validateRequest(passwordResetVerifySchema),
  authController.verifyPasswordResetOtp,
);

AuthRoutes.post(
  '/auth/password-reset/finalize',
  validateRequest(passwordResetFinalizeSchema),
  authController.finalizePasswordReset,
);

AuthRoutes.post('/auth/token/regenerate', regenerateToken);
