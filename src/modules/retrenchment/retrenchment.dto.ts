import {
  DurationUnit,
  PositionTypes,
  RetrenchmentTypes,
  Status,
} from '@/database/enum';

export interface CreateDisciplineDto {
  employeeId: string;
  reason: string;
  retrenchmentType: RetrenchmentTypes;
}

export interface UpdateDisciplineDto extends Partial<CreateDisciplineDto> {
  status?: Status;
}
