import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { PermissionCodeEnum } from '@acme-libs/kernel';

import { StaffRole } from './staff-role.entity';

@Entity({ name: 'staff_role_permissions' })
export class StaffRolePermission {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  public roleId: string;

  @PrimaryColumn({ type: 'varchar', length: 64 })
  public code: PermissionCodeEnum;

  @ManyToOne(() => StaffRole, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id', foreignKeyConstraintName: 'fk_staff_role_permissions_role' })
  public role: StaffRole;
}
