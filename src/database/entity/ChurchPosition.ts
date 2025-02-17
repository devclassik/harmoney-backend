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

@Entity()
export class ChurchPosition {
  constructor(data: ChurchPosition) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: false })
  title?: string;

  @ManyToOne(() => Employee, ({ previousPositions }) => previousPositions)
  @JoinColumn()
  employee?: Employee[];
}
