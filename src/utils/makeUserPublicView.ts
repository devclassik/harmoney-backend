import { User } from '../database';

export const makeUserPublicView = (user: User): User => {
  delete user.id;
  delete user.password;
  delete user.confirmEmailToken;
  delete user.passwordResetToken;
  delete user.confirmBVNToken;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.deletedAt;

  return { ...user };
};
