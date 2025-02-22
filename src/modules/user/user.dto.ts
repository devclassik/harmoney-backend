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

export interface UpdateNotificationDto {
  email: boolean;
  push: boolean;
}
