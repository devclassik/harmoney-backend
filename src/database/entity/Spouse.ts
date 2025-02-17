import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';

enum Genders {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

@Entity()
export class Spouse {
  constructor(data: Spouse) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: false })
  firstName?: string;

  @Column({ type: 'varchar', nullable: false })
  middleName?: string;

  @Column({ type: 'varchar', nullable: false })
  dob?: string;

  @Column({ type: 'varchar', nullable: false })
  weddingDate?: string;

  @OneToOne(() => Employee, ({ spouse }) => spouse)
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
