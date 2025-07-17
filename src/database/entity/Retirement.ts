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
import { Status } from '../enum';

@Entity()
export class Retirement {
  constructor(data: Retirement) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  retirementId?: string;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @ManyToOne(() => Employee, ({ documents }) => documents)
  employee?: Employee;

  @ManyToOne(() => Employee, ({ documents }) => documents)
  recommendedReplacement?: Employee;

  @Column({ type: 'varchar', array: true, nullable: true })
  documents: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
