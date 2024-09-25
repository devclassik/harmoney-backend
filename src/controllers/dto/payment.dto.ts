import { IdentityTypes } from '../../database';

export interface BankDetailsDto {
  accountNumber: string;
  bankCode: string;
  accountName?: string;
}
