import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Permission } from './Permission';

export enum UserRoles {
  ADMIN = 'ADMIN',
  HOD = 'HOD',
  MINISTER = 'MINISTER',
  WORKER = 'WORKER',
}

@Entity()
export class Role {
  constructor(data: Role) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: UserRoles })
  name?: UserRoles;

  @OneToMany(() => User, ({ role }) => role)
  users?: User;

  @OneToMany(() => Permission, ({ role }) => role)
  permissions?: Permission[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
