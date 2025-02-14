import { BusinessCategories, IdentityTypes } from '../../database';

export interface UpdateProfileDto {
  first_name: string;
  last_name: string;
  phone_no: string;
  username: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface InitIdentityDto {
  identityType: IdentityTypes;
  identityNumber: string;
}

export interface FinalizeIdentityDto {
  identityId: string;
  identityType: IdentityTypes;
  otp: string;
}

export interface UpdateNotificationDto {
  email: boolean;
  push: boolean;
}
