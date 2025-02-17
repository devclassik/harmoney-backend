import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateTypes {
  TRANSFER_APPROVAL = 'TRANSFER_APPROVAL',
  TRANSFER_REQUEST = 'TRANSFER_REQUEST',
  TRANSFER_DECLINE = 'TRANSFER_DECLINE',
  SICK_LEAVE_APPROVAL = 'SICK_LEAVE_APPROVAL',
  SICK_LEAVE_REQUEST = 'SICK_LEAVE_REQUEST',
  SICK_LEAVE_DECLINE = 'SICK_LEAVE_DECLINE',
  ANNUAL_LEAVE_APPROVAL = 'ANNUAL_LEAVE_APPROVAL',
  ANNUAL_LEAVE_REQUEST = 'ANNUAL_LEAVE_REQUEST',
  ANNUAL_LEAVE_DECLINE = 'ANNUAL_LEAVE_DECLINE',
  ABSENCE_LEAVE_APPROVAL = 'ABSENCE_LEAVE_APPROVAL',
  ABSENCE_LEAVE_REQUEST = 'ABSENCE_LEAVE_REQUEST',
  ABSENCE_LEAVE_DECLINE = 'ABSENCE_LEAVE_DECLINE',
  PROMOTION_APPROVAL = 'PROMOTION_APPROVAL',
  PROMOTION_REQUEST = 'PROMOTION_REQUEST',
  PROMOTION_DECLINE = 'PROMOTION_DECLINE',
  RETIREMENT_APPROVAL = 'RETIREMENT_APPROVAL',
  RETIREMENT_REQUEST = 'RETIREMENT_REQUEST',
  RETIREMENT_DECLINE = 'RETIREMENT_DECLINE',
  RETRENCHMENT_APPROVAL = 'RETRENCHMENT_APPROVAL',
  RETRENCHMENT_REQUEST = 'RETRENCHMENT_REQUEST',
  RETRENCHMENT_DECLINE = 'RETRENCHMENT_DECLINE',
  DISCIPLINE = 'DISCIPLINE',
}

@Entity()
export class Template {
  constructor(data: Template) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  templateId?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  downloadUrl?: string;

  @Column({ type: 'enum', enum: TemplateTypes })
  type?: TemplateTypes;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
