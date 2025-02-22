import { Status } from 'src/database/enum';

export interface CreateDisciplineDto {
  employeeId: number;
  reason: string;
  recommendedReplacement: number;
}

export interface UpdateDisciplineDto extends Partial<CreateDisciplineDto> {
  status?: Status;
}
