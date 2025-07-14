import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Employee } from './Employee';
import { Organization } from './Organization';

@Entity()
export class Department {
  constructor(data: Department) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  name?: string;

  @ManyToOne(() => Employee, ({ departmentHeads }) => departmentHeads, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn()
  hod?: Employee;

  @ManyToMany(() => Employee, ({ departments }) => departments)
  @JoinTable()
  members?: Employee[];

  @ManyToOne(() => Organization, ({ departments }) => departments)
  @JoinColumn()
  organization?: Organization;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
