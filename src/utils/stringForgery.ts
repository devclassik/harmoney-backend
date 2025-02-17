import { AppFeatures } from '../database/entity';
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';

/**
 * best used to generate random strings
 * @param length default 30
 * @param pattern default 'aA0$', It defines the character content of the resulting generated random string (i.e a = lowercase inclusive, A = uppercase inclusive, 0 = numbers inclusive and $ = special characters inclusive)
 * @returns
 */
export const generateRandomString = async (
  length: number = 30,
  pattern: string = 'aA0$',
): Promise<string> => {
  const possibilities = {
    lowerCased: 'abcdefghijklmnopqrstuvwxyz',
    capitals: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '$%&-@#_',
  };

  let charSet = '';

  pattern.split('').forEach((char) => {
    if (!isNaN(parseInt(char))) {
      charSet += possibilities.numbers;
    } else if (/[a-z]/.test(char)) {
      charSet += possibilities.lowerCased;
    } else if (/[A-Z]/.test(char)) {
      charSet += possibilities.capitals;
    } else {
      charSet += possibilities.special;
    }
  });

  let result = '';

  for (let i = 0; i < length; i++) {
    const charMaxIndex = charSet.length - 1;
    let randomIndex = Math.floor(Math.random() * charMaxIndex);
    if (randomIndex < 0) randomIndex = 0;
    if (randomIndex > charMaxIndex) randomIndex = charMaxIndex;

    result += charSet.charAt(randomIndex);
  }

  return result;
};

export const forgeUsername = async (email: string): Promise<string> => {
  const splitEmail = email.split('@');

  return splitEmail[0].concat(await generateRandomString(5, 'aA0'));
};

export const forgeRandomName = (): string => {
  const customConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 2,
  };

  const shortName: string = uniqueNamesGenerator(customConfig);

  return shortName;
};

export const generateUniqueId = (feature: AppFeatures): string => {
  const timestamp = new Date().getTime().toString().slice(6);
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefixMap: Record<AppFeatures, string> = {
    [AppFeatures.EMPLOYEE]: 'EMP',
    [AppFeatures.PAYROLL]: 'PAY',
    [AppFeatures.DOCUMENT]: 'DOC',
    [AppFeatures.DEPARTMENT]: 'DEP',
    [AppFeatures.ORGANIZATION]: 'ORG',
    [AppFeatures.PERMISSION]: '',
    [AppFeatures.DASHBOARD]: '',
    [AppFeatures.ACCOMMODATION]: '',
    [AppFeatures.EmailTemplate]: '',
    [AppFeatures.MEETING]: '',
    [AppFeatures.LEAVE]: '',
    [AppFeatures.PROMOTION]: '',
    [AppFeatures.TRANSFER]: '',
    [AppFeatures.RETIREMENT]: '',
    [AppFeatures.DISCIPLINE]: '',
    [AppFeatures.RETRENCHMENT]: '',
    [AppFeatures.NOTIFICATION]: '',
    [AppFeatures.REPORT]: '',
  };

  const prefix = prefixMap[feature] || 'GEN';

  return `${prefix}-${timestamp}-${randomStr}`;
};
