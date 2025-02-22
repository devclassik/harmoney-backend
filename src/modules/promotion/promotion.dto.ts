import { PositionTypes, Status } from '@/database/enum';

export interface CreatePromotionDto {
  employeeId: string;
  newPosition: PositionTypes;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  status?: Status;
}
