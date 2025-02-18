import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contact } from './Contact';
import { Spouse } from './Spouse';
import { User } from './User';
import { FamilyMember } from './FamilyMember';
import { SpiritualHistory } from './SpiritualHistory';
import { ChurchPosition } from './ChurchPosition';
import { EmployeeCredential } from './EmployeeCredential';
import { EmployeeDocument } from './EmployeeDocument';
import { Payroll } from './Payroll';
import { Department } from './Department';
import { Leave } from './Leave';
import { Appraisal } from './Appraisal';

enum Genders {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

enum PhoneTypes {
  HOME = 'HOME',
  WORK = 'WORK',
  CELL = 'CELL',
}

export enum EmploymentTypes {
  STAFF = 'STAFF',
  VOLUNTEER = 'VOLUNTEER',
}

export enum TitleTypes {
  MR = 'MR',
  MRS = 'MRS',
  DR = 'DR',
  BAR = 'BAR',
  HON = 'HON',
  CHIEF = 'CHIEF',
}

@Entity()
export class Employee {
  constructor(data: Employee) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', unique: true })
  employeeId?: string;

  @Column({ type: 'enum', enum: TitleTypes, nullable: true })
  title?: TitleTypes;

  @Column({ type: 'varchar', nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', nullable: true })
  middleName?: string;

  @Column({ type: 'enum', enum: Genders, nullable: true })
  gender?: Genders;

  @Column({ type: 'varchar', nullable: true })
  profferedName?: string;

  @Column({ type: 'varchar', nullable: true })
  primaryPhone?: string;

  @Column({ type: 'enum', enum: PhoneTypes, nullable: true })
  primaryPhoneType?: PhoneTypes;

  @Column({ type: 'varchar', nullable: true })
  altPhone?: string;

  @Column({ type: 'enum', enum: PhoneTypes, nullable: true })
  altPhoneType?: PhoneTypes;

  @Column({ type: 'date', nullable: true })
  dob?: string;

  @Column({ type: 'varchar', nullable: true })
  maritalStatus?: string;

  @Column({ type: 'boolean', default: false })
  everDivorced?: boolean;

  @Column({ type: 'boolean', default: false })
  beenConvicted?: boolean;

  @Column({ type: 'boolean', default: false })
  hasQuestionableBackground?: boolean;

  @Column({ type: 'boolean', default: false })
  hasBeenInvestigatedForMisconductOrAbuse?: boolean;

  @Column({ type: 'varchar', nullable: true })
  photoUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  altEmail?: string;

  @Column({ type: 'enum', enum: EmployeeStatus, nullable: true })
  employeeStatus?: EmployeeStatus;

  @Column({ type: 'enum', enum: EmploymentTypes, nullable: true })
  employmentType?: EmploymentTypes;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  @OneToOne(() => User, ({ employee }) => employee)
  user?: User;

  @OneToOne(() => Contact, { nullable: true, cascade: ['insert', 'update'] })
  @JoinColumn()
  homeAddress?: Contact;

  @OneToOne(() => Contact, { nullable: true, cascade: ['insert', 'update'] })
  @JoinColumn()
  mailingAddress?: Contact;

  @OneToOne(() => SpiritualHistory, ({ employee }) => employee, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  spiritualHistory?: SpiritualHistory;

  @OneToMany(() => ChurchPosition, ({ employee }) => employee, {
    cascade: ['insert', 'update'],
  })
  previousPositions?: ChurchPosition[];

  @OneToOne(() => Spouse, ({ employee }) => employee, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  spouse?: Spouse;

  @OneToMany(() => FamilyMember, ({ employee }) => employee, {
    cascade: ['insert', 'update'],
  })
  children?: FamilyMember[];

  @OneToMany(() => EmployeeCredential, ({ employee }) => employee, {
    cascade: ['insert', 'update'],
  })
  credentials?: EmployeeCredential[];

  @OneToMany(() => EmployeeDocument, ({ employee }) => employee, {
    cascade: ['insert', 'update'],
  })
  documents?: EmployeeDocument[];

  @OneToMany(() => Payroll, ({ employee }) => employee)
  payrolls?: Payroll[];

  @OneToMany(() => Department, ({ hod }) => hod)
  departmentHeads?: Department[];

  @ManyToMany(() => Department, ({ members }) => members)
  departments?: Department[];

  @OneToMany(() => Leave, ({ employee }) => employee)
  leaves?: Leave;

  @OneToMany(() => Appraisal, ({ employee }) => employee)
  appraisals?: Appraisal;
}
