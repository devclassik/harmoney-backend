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
import { Employee } from './Employee';
import { Document } from '.';
import { DurationUnit, LeaveTypes, Status } from '../enum';

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

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @Column({ type: 'varchar', nullable: true })
  requestType?: string;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ type: 'varchar', nullable: true })
  letterUrl?: string;

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

  @ManyToOne(() => Employee, { nullable: true })
  substitution?: Employee;

  @Column({ type: 'int', nullable: true })
  substitutionId?: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
