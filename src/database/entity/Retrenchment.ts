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
import { RetrenchmentTypes, Status } from '../enum';

@Entity()
export class Retrenchment {
  constructor(data: Retrenchment) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  retrenchmentId?: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @Column({
    type: 'enum',
    enum: RetrenchmentTypes,
    nullable: true,
  })
  retrenchmentType?: RetrenchmentTypes;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @ManyToOne(() => Employee, ({ documents }) => documents)
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
