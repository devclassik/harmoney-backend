import { PositionTypes, Status, TransferTypes } from '@/database/enum';

export interface CreateDisciplineDto {
  employeeId: string;
  reason: string;
  newPosition: PositionTypes;
  destination: string;
  transferType: TransferTypes;
}

export interface UpdateDisciplineDto extends Partial<CreateDisciplineDto> {
  status?: Status;
}
