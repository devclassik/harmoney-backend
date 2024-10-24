import { BusinessCategories, TransactionCategory } from '../database';

export const resolveTransactionCategory = async (
  businessCategory: BusinessCategories,
): Promise<TransactionCategory | undefined> => {
  const mapping: Record<BusinessCategories, TransactionCategory> = {
    [BusinessCategories.WATER]: TransactionCategory.WATER,
    [BusinessCategories.GAS]: TransactionCategory.GAS,
    [BusinessCategories.INSURANCE]: TransactionCategory.INSURANCE,
    [BusinessCategories.APARTMENT]: TransactionCategory.APARTMENT,
    [BusinessCategories.EDUCATION]: TransactionCategory.EDUCATION,
    [BusinessCategories.GOVERNMENT_PAYMENTS]: TransactionCategory.GOVERNMENT,
    [BusinessCategories.EMBASSIES]: TransactionCategory.EMBASSY,
    [BusinessCategories.BUS]: TransactionCategory.BUS_TICKET,
    [BusinessCategories.TRAIN]: TransactionCategory.TRAIN_TICKET,
    [BusinessCategories.FLIGHT]: TransactionCategory.FLIGHT_TICKET,
    [BusinessCategories.HOTEL]: TransactionCategory.HOTEL,
    [BusinessCategories.MOVIES]: TransactionCategory.MOVIE_TICKET,
    [BusinessCategories.EVENT_TICKETING]: TransactionCategory.EVENT_TICKET,
    [BusinessCategories.PHARMACY]: TransactionCategory.PHARMACY,
    [BusinessCategories.BLOOD_BANK]: TransactionCategory.BLOOD_BANK,
    [BusinessCategories.HOSPITAL]: TransactionCategory.HOSPITAL,
    [BusinessCategories.DOCTOR_CONSULT]: TransactionCategory.DOCTOR_CONSULT,
  };

  return mapping[businessCategory];
};
