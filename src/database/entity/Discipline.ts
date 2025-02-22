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
import { DisciplineTypes, DurationUnit, Status } from '../enum';

@Entity()
export class Discipline {
  constructor(data: Discipline) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  disciplineId?: string;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @Column({ type: 'enum', enum: DisciplineTypes })
  disciplineType?: DisciplineTypes;

  @Column({ type: 'float', default: 0 })
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
