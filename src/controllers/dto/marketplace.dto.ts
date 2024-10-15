import { BusinessCategories } from '../../database';

export interface FetchProviderServicesDto {
  category: BusinessCategories;
  businessId: number;
}

export interface VerifyPowerOrCableTvDataDto {
  serviceId: string;
  meterOrCardNumber: string;
}

export interface BasePurchaseDto {
  serviceId: string;
  amount: number;
  pin: number;
}

export interface AirtimePurchaseDto extends BasePurchaseDto {
  phoneNumber: string;
}

export interface DataPurchaseDto extends AirtimePurchaseDto {
  bundleCode: string;
}

export interface CablePurchaseDto extends BasePurchaseDto {
  bundleCode: string;
  cardNumber: string;
}

export interface UtilityPurchaseDto extends BasePurchaseDto {
  vendType: string;
  meterNumber: string;
}

export interface MerchantPurchaseDto {
  pin: number;
  businessId: number;
  amount: number;
  note?: string;
  payerId?: string;
  serviceId?: number;
  subServiceId?: number;
}
