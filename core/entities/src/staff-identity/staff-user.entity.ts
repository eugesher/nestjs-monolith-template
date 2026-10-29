import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';

import { UserStatusEnum } from '@acme-libs/kernel';
import { StaffUserRole } from './staff-user-role.entity';

@Entity({ name: 'staff_user' })
export class StaffUser {
  @PrimaryColumn({ type: 'char', length: 36 })
  public id: string;

  @Index('uq_staff_user_email', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  public email: string;

  @Column({ type: 'varchar', length: 255 })
  public passwordHash: string;

  @Column({ type: 'varchar', length: 16, default: UserStatusEnum.ACTIVE })
  public status: UserStatusEnum;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @OneToMany(() => StaffUserRole, (userRole) => userRole.user)
  public userRoles: StaffUserRole[];
}
