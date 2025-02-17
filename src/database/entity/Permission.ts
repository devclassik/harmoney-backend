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
import { Role } from './Role';

export enum AppFeatures {
  EMPLOYEE = 'Employee',
  DEPARTMENT = 'Department',
  ORGANIZATION = 'Organization',
  PERMISSION = 'Permission',
  DASHBOARD = 'Dashboard',
  ACCOMMODATION = 'Accommodation',
  EmailTemplate = 'EmailTemplate',
  PAYROLL = 'Payroll',
  MEETING = 'Meeting',
  DOCUMENT = 'Document',
  LEAVE = 'Leave',
  PROMOTION = 'Promotion',
  TRANSFER = 'Transfer',
  RETIREMENT = 'Retirement',
  DISCIPLINE = 'Discipline',
  RETRENCHMENT = 'Retrenchment',
  NOTIFICATION = 'Notification',
  REPORT = 'Report',
}

@Entity()
export class Permission {
  constructor(data: Permission) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: AppFeatures })
  feature?: AppFeatures;

  @Column({ type: 'varchar', default: '' })
  label?: string;

  @Column({ type: 'boolean', default: false })
  canView?: boolean;

  @Column({ type: 'boolean', default: false })
  canCreate?: boolean;

  @Column({ type: 'boolean', default: false })
  canEdit?: boolean;

  @Column({ type: 'boolean', default: false })
  canDelete?: boolean;

  @ManyToOne(() => Role, ({ permissions }) => permissions)
  @JoinColumn()
  role?: Role;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
/*
import { getRepository } from 'typeorm';
import { User } from './User';
import { Permission } from './Permission';

async function createUser(data: Partial<User>) {
  const userRepository = getRepository(User);
  const permissionRepository = getRepository(Permission);

  const newUser = userRepository.create(data);
  await userRepository.save(newUser);

  // Assign predefined permissions based on user role
  const rolePermissions = predefinedPermissions[newUser.userRole || UserRoles.WORKER];
  const permissionsToSave = rolePermissions.map((perm) => {
    return permissionRepository.create({ ...perm, user: newUser });
  });

  await permissionRepository.save(permissionsToSave);
  return newUser;
}
*/
/*
const defaultPermissions = {
  [UserRoles.ADMIN]: {
    [AppFeatures.EMPLOYEE]: {
      canView: 'true',
      canCreate: 'true',
      canUpdate: 'true',
    },
    [AppFeatures.DEPARTMENT]: {
      canView: 'true',
      canCreate: 'true',
      canUpdate: 'true',
    },
    // All other features for ADMIN
  },
  [UserRoles.HOD]: {
    [AppFeatures.EMPLOYEE]: {
      canView: true,
      canCreate: true,
      canUpdate: true,
    },
    [AppFeatures.DEPARTMENT]: {
      canView: true,
      canCreate: true,
      canUpdate: true,
    },
    // All other features for HOD
  },
  [UserRoles.MINISTER]: {
    [AppFeatures.EMPLOYEE]: {
      canView: true,
      canCreate: true,
      canUpdate: true,
    },
    [AppFeatures.DEPARTMENT]: {
      canView: true,
      canCreate: true,
      canUpdate: true,
    },
    // All other features for MINISTER
  },
  [UserRoles.WORKER]: {
    [AppFeatures.EMPLOYEE]: { canView: 'true' }, // Worker can only view
    // Other features for WORKER
  },
};
*/
