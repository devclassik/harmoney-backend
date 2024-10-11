import { Axios } from 'axios';
import config from '../config';
import { logger } from '../utils';
import { IdentityTypes } from '../database';

const getBearerToken = (token: string) => `Bearer ${token}`;

export interface CreateSubAccount {
  otp: string;
  identityId: string;
  phoneNumber: string;
  emailAddress: string;
  identityNumber: string;
  externalReference: string;
  identityType: IdentityTypes;
  callbackUrl?: string;
}

export interface TransferDto {
  nameEnquiryReference: string;
  debitAccountNumber: string;
  beneficiaryBankCode: string;
  beneficiaryAccountNumber: string;
  amount: number;
  saveBeneficiary?: boolean;
  narration?: string;
  paymentReference?: string;
}

export interface MakePurchase {
  amount: number;
  vendType?: string;
  cardNumber?: string;
  bundleCode?: string;
  phoneNumber?: string;
  meterNumber?: string;
  serviceCategoryId: string;
  serviceProvider?: string;
  customerName?: string;
  customerAddress?: string;
  debitAccountNumber?: string;
}

export interface AuthorizationResponse {
  access_token: string;
  client_id: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  ibs_client_id: string;
  ibs_user_id: string;
}

export enum PurchaseTypes {
  DATA = 'data',
  CABLE = 'cable-tv',
  UTILITY = 'utility',
  AIRTIME = 'airtime',
}

export class SafeHaven {
  private defaultHeader = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
  };

  private axios = new Axios({
    baseURL: config.safehaven.url,
  });

  private paths = {
    getToken: '/oauth2/token',
    getAllVas: '/vas/services',
    verifyPowerOrCableInfo: '/vas/verify',
    getOneVas: (id: string) => `/vas/service/${id}`,
    getOneVasCategories: (id: string) =>
      `/vas/service/${id}/service-categories`,
    getCategoryProducts: (id: string) => `/vas/service-category/${id}/products`,
    purchase: (type: PurchaseTypes) => `/vas/pay/${type}`,
    getBanks: '/transfers/banks',
    nameEnquiry: '/transfers/name-enquiry',
    createSubAccount: '/accounts/v2/subaccount',
    initIdentityCheck: '/identity/v2',
    verifyIdentityCheck: '/identity/v2/validate',
    transfer: '/transfer',
  };

  private getAccessToken = async (): Promise<AuthorizationResponse> => {
    try {
      const result = await this.axios.post(
        `${this.paths.getToken}`,
        JSON.stringify({
          client_id: config.safehaven.client_id,
          grant_type: config.safehaven.grant_type,
          client_assertion: config.safehaven.client_assertion,
          client_assertion_type: config.safehaven.client_assertion_type,
        }),
        {
          headers: { ...this.defaultHeader },
        },
      );

      // logger.info('tokennnn: ');
      // logger.info(JSON.stringify(result.data));
      return JSON.parse(result.data);
    } catch (error) {
      throw error;
    }
  };

  public getAllVas = async () => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.get(`${this.paths.getAllVas}`, {
        headers: {
          ...this.defaultHeader,
          ClientID: ibs_client_id,
          Authorization: getBearerToken(access_token),
        },
      });

      const res = JSON.parse(result.data);
      logger.info(`getAllVas response: ${res}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public getOneVas = async (vasId: string) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.get(`${this.paths.getOneVas(vasId)}`, {
        headers: {
          ...this.defaultHeader,
          ClientID: ibs_client_id,
          Authorization: getBearerToken(access_token),
        },
      });

      const res = JSON.parse(result.data);
      logger.info(`getOneVas response: ${res}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public getVasCategories = async (vasId: string) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.get(
        `${this.paths.getOneVasCategories(vasId)}`,
        {
          headers: {
            ...this.defaultHeader,
            ClientID: ibs_client_id,
            Authorization: getBearerToken(access_token),
          },
        },
      );

      const res = JSON.parse(result.data);
      logger.info(`getVasCategories response: ${res}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public getCategoryProducts = async (categoryId: string) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.get(
        `${this.paths.getCategoryProducts(categoryId)}`,
        {
          headers: {
            ...this.defaultHeader,
            ClientID: ibs_client_id,
            Authorization: getBearerToken(access_token),
          },
        },
      );

      const res = JSON.parse(result.data);
      logger.info(`getCategoryProducts response: ${res}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public verifyPowerOrCableInfo = async (
    serviceCategoryId: string,
    entityNumber: string,
  ) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const headers = {
        ...this.defaultHeader,
        ClientID: ibs_client_id,
        Authorization: getBearerToken(access_token),
      };

      const dataString = JSON.stringify({ serviceCategoryId, entityNumber });

      const url = `${this.paths.verifyPowerOrCableInfo}`;
      const result = await this.axios.post(url, dataString, {
        headers,
      });

      const res = JSON.parse(result.data);
      logger.info(`verifyPowerOrCableInfo response: ${res}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public airtimePurchase = async (payload: MakePurchase) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const headers = {
        ...this.defaultHeader,
        ClientID: ibs_client_id,
        Authorization: getBearerToken(access_token),
      };

      const dataString = JSON.stringify({
        channel: 'WEB',
        amount: +payload.amount,
        phoneNumber: payload.phoneNumber,
        serviceCategoryId: payload.serviceCategoryId,
        debitAccountNumber:
          payload.debitAccountNumber ?? config.safehaven.debit_account,
      });

      const url = `${this.paths.purchase(PurchaseTypes.AIRTIME)}`;
      const result = await this.axios.post(url, dataString, {
        headers,
      });

      const res = JSON.parse(result.data);
      logger.info(`airtimePurchase response: ${result.data}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public dataPurchase = async (payload: MakePurchase) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const headers = {
        ...this.defaultHeader,
        ClientID: ibs_client_id,
        Authorization: getBearerToken(access_token),
      };

      const dataString = JSON.stringify({
        channel: 'WEB',
        amount: +payload.amount,
        bundleCode: payload.bundleCode,
        phoneNumber: payload.phoneNumber,
        serviceCategoryId: payload.serviceCategoryId,
        debitAccountNumber:
          payload.debitAccountNumber ?? config.safehaven.debit_account,
      });

      const url = `${this.paths.purchase(PurchaseTypes.DATA)}`;
      const result = await this.axios.post(url, dataString, {
        headers,
      });

      const res = JSON.parse(result.data);
      logger.info(`dataPurchase response: ${result.data}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public cablePurchase = async (payload: MakePurchase) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const headers = {
        ...this.defaultHeader,
        ClientID: ibs_client_id,
        Authorization: getBearerToken(access_token),
      };

      const dataString = JSON.stringify({
        channel: 'WEB',
        amount: +payload.amount,
        cardNumber: payload.cardNumber,
        bundleCode: payload.bundleCode,
        serviceCategoryId: payload.serviceCategoryId,
        debitAccountNumber:
          payload.debitAccountNumber ?? config.safehaven.debit_account,
      });

      const url = `${this.paths.purchase(PurchaseTypes.CABLE)}`;
      const result = await this.axios.post(url, dataString, {
        headers,
      });

      const res = JSON.parse(result.data);
      logger.info(`cablePurchase response: ${result.data}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public utilityPurchase = async (payload: MakePurchase) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const headers = {
        ...this.defaultHeader,
        ClientID: ibs_client_id,
        Authorization: getBearerToken(access_token),
      };

      const dataString = JSON.stringify({
        channel: 'WEB',
        amount: +payload.amount,
        vendType: payload.vendType,
        meterNumber: payload.meterNumber,
        serviceCategoryId: payload.serviceCategoryId,
        debitAccountNumber:
          payload.debitAccountNumber ?? config.safehaven.debit_account,
      });
      
      const url = `${this.paths.purchase(PurchaseTypes.UTILITY)}`;
      const result = await this.axios.post(url, dataString, {
        headers,
      });

      const res = JSON.parse(result.data);
      logger.info(`utilityPurchase response: ${result.data}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public getAllBanks = async () => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.get(`${this.paths.getBanks}`, {
        headers: {
          ...this.defaultHeader,
          ClientID: ibs_client_id,
          Authorization: getBearerToken(access_token),
        },
      });

      return JSON.parse(result.data);
    } catch (error) {
      throw error;
    }
  };

  public getAccountDetails = async (payload: {
    accountNumber: string;
    bankCode: string;
  }) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.post(
        `${this.paths.nameEnquiry}`,
        JSON.stringify(payload),
        {
          headers: {
            ...this.defaultHeader,
            ClientID: ibs_client_id,
            Authorization: getBearerToken(access_token),
          },
        },
      );

      return JSON.parse(result.data);
    } catch (error) {
      throw error;
    }
  };

  public initiateIdentityCheck = async (payload: {
    type: IdentityTypes;
    number: string;
  }) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.post(
        `${this.paths.initIdentityCheck}`,
        JSON.stringify({
          ...payload,
          debitAccountNumber: config.safehaven.debit_account,
        }),
        {
          headers: {
            ...this.defaultHeader,
            ClientID: ibs_client_id,
            Authorization: getBearerToken(access_token),
          },
        },
      );

      return JSON.parse(result.data);
    } catch (error) {
      throw error;
    }
  };

  public finalizeIdentityCheck = async (payload: {
    type: IdentityTypes;
    identityId: string;
    otp: string;
  }) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.post(
        `${this.paths.verifyIdentityCheck}`,
        JSON.stringify(payload),
        {
          headers: {
            ...this.defaultHeader,
            ClientID: ibs_client_id,
            Authorization: getBearerToken(access_token),
          },
        },
      );

      return JSON.parse(result.data);
    } catch (error) {
      throw error;
    }
  };

  public createSubAccount = async (payload: CreateSubAccount) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.post(
        `${this.paths.createSubAccount}`,
        JSON.stringify(payload),
        {
          headers: {
            ...this.defaultHeader,
            ClientID: ibs_client_id,
            Authorization: getBearerToken(access_token),
          },
        },
      );

      const res = JSON.parse(result.data);
      logger.info(`createSubAccount response: ${result.data}`);
      return res;
    } catch (error) {
      throw error;
    }
  };

  public transferFund = async (payload: TransferDto) => {
    try {
      const { access_token, ibs_client_id } = await this.getAccessToken();

      const result = await this.axios.post(
        `${this.paths.createSubAccount}`,
        JSON.stringify(payload),
        {
          headers: {
            ...this.defaultHeader,
            ClientID: ibs_client_id,
            Authorization: getBearerToken(access_token),
          },
        },
      );

      const res = JSON.parse(result.data);
      logger.info(`Transfer response: ${res.data}`);
      return res;
    } catch (error) {
      throw error;
    }
  };
}
