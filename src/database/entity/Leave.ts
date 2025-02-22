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
import { Document } from '.';
import { DurationUnit } from '../enum';

export enum LeaveTypes {
  SICK = 'SICK',
  ABSENCE = 'ABSENCE',
  ANNUAL = 'ANNUAL',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Leave {
  constructor(data: Leave) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  leaveId?: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'enum', enum: LeaveTypes, default: LeaveTypes.ANNUAL })
  type?: LeaveTypes;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.PENDING })
  status?: LeaveStatus;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ type: 'float', default: 0 })
  duration?: number;

  @Column({ type: 'enum', enum: DurationUnit, default: DurationUnit.DAY })
  durationUnit?: DurationUnit;

  @OneToMany(() => Document, ({ leave }) => leave, {
    cascade: ['insert', 'update'],
  })
  leaveNotes?: Document[];

  @ManyToOne(() => Employee, ({ leaves }) => leaves, {
    cascade: ['insert', 'update'],
  })
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
