import { User } from '../database';

export const makeUserPublicView = (user: User): User => {
  delete user.id;
  delete user.password;
  delete user.verifyEmailOTP;
  delete user.passwordResetOTP;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.deletedAt;

  return user;
};
