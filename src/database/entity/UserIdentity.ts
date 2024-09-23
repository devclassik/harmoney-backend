import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MerchantBusiness } from './MerchantBusiness';
import { User } from './User';

export enum IdentityTypes {
  BVN = 'BVN',
  NIN = 'NIN',
  CAC = 'CAC',
}

@Entity('user_identities')
export class UserIdentity {
  constructor(data: UserIdentity) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: IdentityTypes, default: null, nullable: true })
  type?: IdentityTypes;

  @Column({ type: 'varchar', default: null, nullable: true })
  number?: string;

  @Column({ type: 'bool', default: false })
  validated?: boolean;

  @Column({ type: 'varchar', default: null, nullable: true })
  identityId?: string;

  @Column({ type: 'varchar', nullable: true })
  confirmToken?: string;

  @ManyToOne(() => User, ({ identities }) => identities)
  @JoinColumn()
  user?: User;

  @ManyToOne(() => MerchantBusiness, ({ identities }) => identities)
  @JoinColumn()
  business?: MerchantBusiness;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
