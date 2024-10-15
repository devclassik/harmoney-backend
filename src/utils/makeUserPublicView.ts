import { User } from '../database';

export const makeUserPublicView = (user: User): User & { hasPin: boolean } => {
  delete user.id;
  delete user.password;
  delete user.confirmEmailToken;
  delete user.passwordResetToken;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.deletedAt;

  const hasPin = !!user?.wallet?.txPin;

  delete user?.wallet?.txPin;

  return { ...user, hasPin };
};
