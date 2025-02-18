import { DurationUnit } from '@/database/enum';

export interface BaseLeaveDto {
  startDate: Date;
  reason: string;
}

export interface CreateAnnualLeaveDto extends BaseLeaveDto {
  endDate: Date;
}

export interface UpdateAnnualLeaveDto extends Partial<CreateAnnualLeaveDto> {}

export interface CreateAbsenceLeaveDto extends BaseLeaveDto {
  location?: string;
  duration: number;
  durationUnit: DurationUnit;
  leaveNotesUrls?: string[];
}

export interface UpdateAbsenceLeaveDto extends Partial<CreateAbsenceLeaveDto> {}

export interface CreateSickLeaveDto extends CreateAbsenceLeaveDto {}

export interface UpdateSickLeaveDto extends Partial<CreateSickLeaveDto> {}

export interface GetLeaveDto {
  leaveId: number;
}

export interface DeleteLeaveDto {
  leaveId: number;
}
