import { BusinessCategories } from '../../database';

export interface UpdateBusinessProfileDto {
  business_name: string;
  category: BusinessCategories;
  address: string;
}

export interface UpdateBusinessBankDetailsDto {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName?: string;
}

export interface CreateServiceDto {
  name: string;
  amount?: number;
  isFixedAmount?: boolean;
  imageUrl?: string;
  subServiceName?: string;
}

export interface UpdateServiceDto {
  serviceId: number;
  name: string;
  amount?: number;
  isFixedAmount?: boolean;
  imageUrl?: string;
  subServiceName?: string;
}

export interface CreateLocationDto {
  name: string;
  imageUrl?: string;
}

export interface UpdateLocationDto {
  locationId: number;
  name: string;
  imageUrl?: string;
}
