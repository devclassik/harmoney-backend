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

export enum RetrenchmentTypes {
  VERBAL = 'VERBAL',
  WRITTEN = 'WRITTEN',
  SUSPENSION = 'SUSPENSION',
  TERMINATION = 'TERMINATION',
  DEMOTION = 'DEMOTION',
  PROMOTION = 'PROMOTION',
}

@Entity()
export class Retrenchment {
  constructor(data: Retrenchment) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  retirementId?: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @Column({
    type: 'enum',
    enum: RetrenchmentTypes,
    default: RetrenchmentTypes.VERBAL,
  })
  type?: RetrenchmentTypes;

  @ManyToOne(() => Employee, ({ documents }) => documents)
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
