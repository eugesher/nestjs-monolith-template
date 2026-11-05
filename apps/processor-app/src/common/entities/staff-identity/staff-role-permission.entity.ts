import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { StaffPermission } from './staff-permission.entity';
import { StaffRole } from './staff-role.entity';

@Entity({ name: 'staff_role_permissions' })
export class StaffRolePermission {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  public roleId: string;

  @PrimaryColumn({ type: 'bigint', unsigned: true })
  public permissionId: string;

  @ManyToOne(() => StaffRole, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id', foreignKeyConstraintName: 'fk_staff_role_permissions_role' })
  public role: StaffRole;

  @ManyToOne(() => StaffPermission, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'permission_id',
    foreignKeyConstraintName: 'fk_staff_role_permissions_permission',
  })
  public permission: StaffPermission;
}
