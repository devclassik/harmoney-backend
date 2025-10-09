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
import { PositionTypes, Status } from '../enum';

@Entity()
export class Promotion {
  constructor(data: Promotion) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  promotionId?: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status?: Status;

  @Column({ type: 'varchar', nullable: true })
  letterUrl?: string;

  @Column({ type: 'enum', enum: PositionTypes, nullable: true })
  newPosition?: PositionTypes;

  @ManyToOne(() => Employee, ({ documents }) => documents)
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
