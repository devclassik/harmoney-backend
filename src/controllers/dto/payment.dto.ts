export interface BankDetailsDto {
  accountNumber: string;
  bankCode: string;
}

export interface WebhookDto {
  type: string;
  data: {
    _id: string;
    client: string;
    account: string;
    type: string;
    sessionId: string;
    nameEnquiryReference: string;
    paymentReference: string;
    mandateReference?: string;
    isReversed: boolean;
    reversalReference?: string;
    provider: string;
    providerChannel: string;
    providerChannelCode: string;
    destinationInstitutionCode: string;
    creditAccountName: string;
    creditAccountNumber: string;
    creditBankVerificationNumber?: string;
    creditKYCLevel: string;
    debitAccountName: string;
    debitAccountNumber: string;
    debitBankVerificationNumber?: string;
    debitKYCLevel: string;
    transactionLocation: string;
    narration: string;
    amount: number;
    fees: number;
    vat: number;
    stampDuty: number;
    responseCode: string;
    responseMessage: string;
    status: string;
    isDeleted: false;
    createdAt: string;
    updatedAt: string;
    __v: number;
    approvedAt: string;
  };
}
