import { DocumentTypes } from 'src/database/enum';

export interface CreateCampMeetingDto {
  name: string;
  agenda: string;
  startDate: Date;
  endDate: Date;
  attendees: number[];
}

export interface UpdateCampMeetingDto extends Partial<CreateCampMeetingDto> {}

export interface AssignRoomDto {
  meetingId: number;
  roomId: number;
  employeeId: number;
}
