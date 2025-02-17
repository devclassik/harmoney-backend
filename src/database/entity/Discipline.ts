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
import { Status } from './AppraisalScore';

export enum DisciplineTypes {
  VERBAL = 'VERBAL',
  WRITTEN = 'WRITTEN',
  SUSPENSION = 'SUSPENSION',
  TERMINATION = 'TERMINATION',
  DEMOTION = 'DEMOTION',
  PROMOTION = 'PROMOTION',
}

enum DurationUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

@Entity()
export class Discipline {
  constructor(data: Discipline) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  promotionId?: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @Column({ type: 'enum', enum: DisciplineTypes })
  type?: DisciplineTypes;

  @Column({ type: 'double', default: 0 })
  duration?: number;

  @Column({ type: 'enum', enum: DurationUnit, default: DurationUnit.DAY })
  durationUnit?: DurationUnit;

  @ManyToOne(() => Employee, ({ documents }) => documents)
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
