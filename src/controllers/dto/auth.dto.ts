import { AccountType, BusinessCategories } from 'database';

export interface RegisterDto {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  password: string;
  confirmPassword: string;
  account_type: AccountType;
  // merchants only
  business_name?: string;
  category?: BusinessCategories;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyPasswordResetOtpDto {
  email: string;
  otp: string;
}

export interface SetNewPasswordDto {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}
