import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Employee } from './Employee';
import { Department } from './Department';
import { Accommodation } from './Accommodation';

@Entity()
export class Room {
  constructor(data: Room) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  name?: string;

  @Column({ type: 'float', default: null, nullable: true })
  capacity?: number;

  @ManyToOne(() => Accommodation, ({ rooms }) => rooms)
  accommodation?: Accommodation;

  // @ManyToMany(() => Accommodation, ({ rooms }) => rooms)
  // accommodation?: Accommodation;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
