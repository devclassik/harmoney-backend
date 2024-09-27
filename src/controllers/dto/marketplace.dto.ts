import { BusinessCategories } from '../../database';

export interface FetchProviderServicesDto {
  category: BusinessCategories;
  businessId: number;
}
