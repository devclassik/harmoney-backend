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
import { AppraisalScore } from './AppraisalScore';

@Entity()
export class Appraisal {
  constructor(data: Appraisal) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'double', default: null, nullable: true })
  averageScore?: number;

  @Column({ type: 'date', default: null, nullable: true })
  startDate?: Date;

  @Column({ type: 'date', default: null, nullable: true })
  endDate?: Date;

  @ManyToOne(() => Employee, ({ appraisals }) => appraisals, {
    cascade: ['insert', 'update'],
  })
  employee?: Employee;

  @OneToMany(() => AppraisalScore, ({ appraisal }) => appraisal, {
    cascade: ['insert', 'update'],
  })
  scores?: AppraisalScore[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
