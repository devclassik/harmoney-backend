import { PositionTypes, Status } from 'src/database/enum';

export interface CreatePromotionDto {
  employeeId: string;
  newPosition: PositionTypes;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  status?: Status;
}
