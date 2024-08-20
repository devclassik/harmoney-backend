import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Wallet } from "./Wallet";


@Entity("users")
export class User {
  constructor(data: User) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: "varchar", unique: true, nullable: false })
  email?: string;

  @Column({ type: "varchar", nullable: false })
  password?: string;

  @Column({ type: "varchar", nullable: true })
  confirmEmailToken?: string;

  @Column({ type: "boolean", default: false })
  isEmailVerified?: boolean;

  @Column({ type: "varchar", nullable: true })
  passwordResetToken?: string;

  @Column({ type: "varchar", unique: true, nullable: true })
  username?: string;

  @Column({ type: "varchar", nullable: true })
  avatarUrl?: string;

  @Column({ type: "varchar", unique: true, nullable: true })
  refCode?: string;
  
  
  @OneToMany(() => Wallet, ({ user }) => user)
  @JoinColumn()
  wallets?: Wallet[];


  @CreateDateColumn({ type: "timestamp" })
  createdAt?: Date;

  @UpdateDateColumn({ type: "timestamp"})
  updatedAt?: Date;

  @DeleteDateColumn({ type: "timestamp"})
  deletedAt?: Date;
}
