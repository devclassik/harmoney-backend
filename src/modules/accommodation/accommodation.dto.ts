import { AccommodationTypes } from '../../database';

export interface CreateAccommodationDto {
  name: string;
  type: AccommodationTypes;
  isPetAllowed?: boolean;
  rooms: Array<{ name: string; capacity: number }>;
}

export interface UpdateAccommodationDto
  extends Partial<CreateAccommodationDto> {}
