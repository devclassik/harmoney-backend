import { DocumentTypes } from '../../database/enum';

export interface CreateDocumentDto {
    documentId?: string;
    name: string;
    downloadUrl: string;
    type?: DocumentTypes;
}

export interface UpdateDocumentDto extends Partial<CreateDocumentDto> {
    documentId?: string;
    name?: string;
    downloadUrl?: string;
    type?: DocumentTypes;
} 