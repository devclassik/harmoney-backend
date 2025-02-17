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
import { User } from './User';
import { Employee } from './Employee';
import { ChurchPosition } from './ChurchPosition';
import { Contact } from './Contact';

@Entity()
export class EmployeeCredential {
  constructor(data: EmployeeCredential) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  name?: string;

  @Column({ type: 'varchar', default: false })
  number?: string;

  @Column({ type: 'varchar', default: false })
  issuedDate?: string;

  @Column({ type: 'varchar', nullable: true })
  expirationDate?: string;

  @ManyToOne(() => Employee, ({ credentials }) => credentials)
  @JoinColumn()
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
