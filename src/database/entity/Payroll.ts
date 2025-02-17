import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum PaymentStatus {
  INITIALIZED = 'INITIALIZED',
  AUTHORIZED = 'AUTHORIZED',
  FAILED = 'FAILED',
  SUCCESSFUL = 'SUCCESSFUL',
  PENDING = 'PENDING',
  REVERSED = 'REVERSED',
}

@Entity()
export class Payroll {
  constructor(data: Payroll) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  payrollId?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.INITIALIZED,
  })
  status?: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  reference?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  amount?: number;

  @ManyToOne(() => Employee, ({ payrolls }) => payrolls)
  @JoinColumn()
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
