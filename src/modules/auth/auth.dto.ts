export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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

export interface CreateNewPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}
