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
import { Appraisal } from './Appraisal';
import { AppraisalCriterial } from '../enum';

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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
    enum: AppraisalCriterial,
    nullable: true,
  })
  criterial?: AppraisalCriterial;

  @ManyToOne(() => Appraisal, ({ scores }) => scores)
  appraisal?: Appraisal;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
