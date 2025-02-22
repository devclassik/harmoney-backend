import { AppraisalCriterial } from '@/database/enum';

export interface CreateAppraisalDto {
  startDate: Date;
  endDate: Date;
  averageScore: number;
  scores: Array<{
    criterial: AppraisalCriterial;
    score: number;
  }>;
}

export interface UpdateAppraisalDto extends Partial<CreateAppraisalDto> {}

export interface GetAppraisalDto {
  appraisalId: number;
}

export interface DeleteAppraisalDto {
  appraisalId: number;
}
