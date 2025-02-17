import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
export class FamilyMember {
  constructor(data: FamilyMember) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: false })
  name?: string;

  @Column({ type: 'varchar', nullable: false })
  dob?: string;

  @Column({ type: 'enum', enum: Genders, nullable: true })
  gender?: Genders;

  @ManyToOne(() => Employee, ({ children }) => children)
  @JoinColumn()
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
