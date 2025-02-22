import {
  Genders,
  PhoneTypes,
  EmployeeStatus,
  EmploymentTypes,
  TitleTypes,
  SpiritualStatus,
} from '../../database/enum';
import { UserRoles } from '../../database';

export interface CreateEmployeeDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  role: UserRoles;
  location: string;
  employmentType: string;
}

export interface UpdateEmployeeDto
  extends Partial<CreateEmployeeDto>,
    Partial<HomeContactDto>,
    Partial<MailingContactDto>,
    Partial<CreateSpouseDto>,
    Partial<CreateSpiritualHistoryDto>,
    Partial<FirstSermonContactDto>,
    Partial<CurrentChurchContactDto>,
    Partial<CreateEmployeeCredentialDto> {
  title?: TitleTypes;
  middleName?: string;
  gender?: Genders;
  profferedName?: string;

  primaryPhone?: string;
  primaryPhoneType?: PhoneTypes;
  altPhone?: string;
  altPhoneType?: PhoneTypes;
  dob?: string;
  photoUrl?: string;
  altEmail?: string;

  maritalStatus?: string;
  everDivorced?: boolean;

  employeeStatus?: EmployeeStatus;
  employmentType?: EmploymentTypes;

  beenConvicted?: boolean;
  hasQuestionableBackground?: boolean;
  hasBeenInvestigatedForMisconductOrAbuse?: boolean;

  previousChurchPositions?: string[];
  children?: Array<ChildDto>;
}

export class HomeContactDto {
  homeAddress?: string;
  homeCity?: string;
  homeState?: string;
  homeCountry?: string;
  homeZipCode?: string;
}

export class MailingContactDto {
  mailingAddress?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingCountry?: string;
  mailingZipCode?: string;
}

export class CreateSpouseDto {
  spouseFirstName: string;
  spouseMiddleName: string;
  spouseDob: string;
  weddingDate: string;
}

export class ChildDto {
  childName: string;
  childDob: string;
  childGender?: Genders;
}

export class CreateSpiritualHistoryDto {
  yearSaved?: string;
  sanctified: boolean;
  baptizedWithWater: boolean;
  yearOfWaterBaptism?: string;
  firstYearInChurch?: string;
  isFaithfulInTithing: boolean;
  firstSermonPastor?: string;
  currentPastor?: string;
  dateOfFirstSermon?: string;
  spiritualStatus?: SpiritualStatus;
}

export class FirstSermonContactDto {
  firstSermonAddress?: string;
  firstSermonCity?: string;
  firstSermonState?: string;
  firstSermonCountry?: string;
  firstSermonZipCode?: string;
}

export class CurrentChurchContactDto {
  currentChurchAddress?: string;
  currentChurchCity?: string;
  currentChurchState?: string;
  currentChurchCountry?: string;
  currentChurchZipCode?: string;
}

export class CreateEmployeeCredentialDto {
  credentialName?: string;
  credentialNumber: string;
  credentialIssuedDate: string;
  credentialExpirationDate?: string;
}
