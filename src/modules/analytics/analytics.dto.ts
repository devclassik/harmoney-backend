import { Status } from '@/database/enum';

export interface GetLeaveStatDto {
  year: number;
  status: Status;
}
