import { Status } from 'src/database/enum';

export interface GetLeaveStatDto {
  year: number;
  status: Status;
}
