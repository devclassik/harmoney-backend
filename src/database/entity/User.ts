import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee, Role, Notification } from '.';

@Entity()
export class User {
  constructor(data: User) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email?: string;

  @Column({ type: 'varchar', nullable: false })
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  verifyEmailOTP?: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified?: boolean;

  @Column({ type: 'varchar', nullable: true })
  passwordResetOTP?: string;

  @Column({ type: 'boolean', default: false })
  isLoggedIn?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  // Relations

  @OneToOne(() => Employee, ({ user }) => user, { onDelete: 'CASCADE' })
  @JoinColumn()
  employee?: Employee;

  @ManyToOne(() => Role, ({ users }) => users)
  @JoinColumn()
  role?: Role;
}
