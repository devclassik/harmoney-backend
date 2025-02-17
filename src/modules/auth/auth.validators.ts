import Joi from 'joi';
import { CreateNewPasswordDto, RegisterDto } from './auth.dto';

export const registerSchema = Joi.object<RegisterDto>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const resendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyRegisterOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const passwordResetInitiateSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const passwordResetVerifySchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const passwordResetFinalizeSchema = Joi.object<CreateNewPasswordDto>({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
});
