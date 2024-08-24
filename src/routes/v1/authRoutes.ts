import express from 'express';
import { AuthController } from '../../controllers';
import { regenerateToken, authGuard } from '../../middlewares';

export const AuthRoutes = express.Router();

const authController = new AuthController();

AuthRoutes.post('/auth/register', authController.register);
AuthRoutes.post('/auth/login', authController.login);

AuthRoutes.post(
  '/auth/resend-signup-otp',
  authGuard,
  authController.resendSignupEmailVerificationOtp,
);
AuthRoutes.post(
  '/auth/verify/email',
  authGuard,
  authController.verifySignupOtp,
);

AuthRoutes.post(
  '/auth/password-reset/initiate',
  authController.initiatePasswordReset,
);
AuthRoutes.post(
  '/auth/password-reset/verify',
  authController.verifyPasswordResetOtp,
);
AuthRoutes.post(
  '/auth/password-reset/finalize',
  authController.finalizePasswordReset,
);

AuthRoutes.post('/auth/token/regenerate', regenerateToken);
