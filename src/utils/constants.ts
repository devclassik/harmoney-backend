export const MESSAGES = {
  PROCESSING_ERROR: 'Request Processing error',
  OPS_SUCCESSFUL: 'Operation Successful',
  OPS_FAILED: 'Operation Failed',
  NOT_FOUND: 'Not found',
  RESOURCE_NOT_FOUND: (resource: string) => `${resource} not found.`,
  INVALID_RESOURCE: (resource: string) => `Invalid ${resource}.`,
  DUPLICATE: (resource: string) => `${resource} already exist.`,
  UNABLE_TO_VALIDATE_WALLET: 'Error encountered while validating wallet.',
  EMAIL_TOKEN_SENT: (email: string) =>
    `Email verification token sent to ${email}.`,
  EMAIL_ALREADY_USED: 'Email already in use by another user.',
  CONFIRM_PASSWORD_ERROR: 'Confirm password mismatch.',
  VERIFICATION_SUCCESSFUL: 'Verification successfully completed!',
  VERIFICATION_FAILED: 'Verification failed',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_OTP: 'Invalid OTP.',
  FILE_SIZE_LIMIT: (limit: string) => `File size exceeded limit of ${limit}`,
  CONFIRM_PIN_ERROR: 'Confirm transaction pin mismatch.',
  INSUFFICIENT_BALANCE: 'Insufficient Balance.',
};

export const QUARTERLY_MONTHS = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
