import { DocumentTypes } from 'src/database/enum';

export interface CreateFileIndexDto {
  name: string;
  downloadUrl: string;
  fileType: DocumentTypes;
}

export interface UpdateFileIndexDto extends Partial<CreateFileIndexDto> {}
