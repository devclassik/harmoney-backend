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

export enum TransferTypes {
  VERBAL = 'VERBAL',
  WRITTEN = 'WRITTEN',
  SUSPENSION = 'SUSPENSION',
  TERMINATION = 'TERMINATION',
  DEMOTION = 'DEMOTION',
  PROMOTION = 'PROMOTION',
}

@Entity()
export class Transfer {
  constructor(data: Transfer) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  transferId?: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @Column({ type: 'enum', enum: TransferTypes })
  type?: TransferTypes;

  @Column({ type: 'varchar', default: 0 })
  destination?: string;

  @ManyToOne(() => Employee, ({ documents }) => documents)
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
