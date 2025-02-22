import { DisciplineTypes, DurationUnit, Status } from '@/database/enum';

export interface CreateDisciplineDto {
  employeeId: string;
  reason: string;
  duration: number;
  durationUnit: DurationUnit;
  disciplineType: DisciplineTypes;
}

export interface UpdateDisciplineDto extends Partial<CreateDisciplineDto> {
  status?: Status;
}
