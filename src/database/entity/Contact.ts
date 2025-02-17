import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Employee } from './Employee';

@Entity()
export class Contact {
  constructor(data: Contact) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  address?: string;

  @Column({ type: 'varchar', default: false })
  city?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string;

  @Column({ type: 'varchar', nullable: true })
  zipCode?: string;

  @OneToOne(() => Employee, ({ homeAddress }) => homeAddress)
  employeeHome?: Employee;

  @OneToOne(() => Employee, ({ mailingAddress }) => mailingAddress)
  employeeMailing?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
