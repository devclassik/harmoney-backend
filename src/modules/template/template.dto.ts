import { TemplateTypes } from '../../database';

export class CreateTemplateDto {
  type: TemplateTypes;
}

export class UpdateTemplateDto {
  templateId?: number;
  type?: TemplateTypes;
}
