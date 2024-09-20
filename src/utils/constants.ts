export const MESSAGES = {
  PROCESSING_ERROR: 'Request Processing error',
  OPS_SUCCESSFUL: 'Operation Successful',
  NOT_FOUND: 'Not found',
  RESOURCE_NOT_FOUND: (resource: string) => `${resource} not found.`,
  DUPLICATE: (resource: string) => `${resource} already exist.`,
  UNABLE_TO_VALIDATE_WALLET: 'Error encountered while validating wallet.',
  EMAIL_TOKEN_SENT: (email: string) =>
    `Email verification token sent to ${email}.`,
  EMAIL_ALREADY_USED: 'Email already in use by another user.',
  CONFIRM_PASSWORD_ERROR: 'Confirm password mismatch.',
  VERIFICATION_SUCCESSFUL: 'Verification successfully completed!',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_OTP: 'Invalid OTP.',
  FILE_SIZE_LIMIT: (limit: string) => `File size exceeded limit of ${limit}`,
  CONFIRM_PIN_ERROR: 'Confirm transaction pin mismatch.',
};
