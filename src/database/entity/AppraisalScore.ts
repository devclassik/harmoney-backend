import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Employee } from './Employee';
import { ChurchPosition } from './ChurchPosition';
import { Contact } from './Contact';
import { Appraisal } from './Appraisal';

export enum AppraisalTypes {
  VERBAL = 'VERBAL',
  WRITTEN = 'WRITTEN',
  SUSPENSION = 'SUSPENSION',
  TERMINATION = 'TERMINATION',
  DEMOTION = 'DEMOTION',
  PROMOTION = 'PROMOTION',
}

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

enum DurationUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

@Entity()
export class AppraisalScore {
  constructor(data: AppraisalScore) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'double', default: null, nullable: true })
  score?: number;

  @Column({
    type: 'enum',
    enum: AppraisalTypes,
    default: AppraisalTypes.VERBAL,
  })
  criterial?: AppraisalTypes;

  @ManyToOne(() => Appraisal, ({ scores }) => scores)
  appraisal?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
