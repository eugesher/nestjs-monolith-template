import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity({ name: 'role_permissions' })
export class RolePermission {
  @PrimaryColumn({ type: 'int' })
  public roleId: number;

  @PrimaryColumn({ type: 'int' })
  public permissionId: number;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id', foreignKeyConstraintName: 'fk_role_permissions_role' })
  public role: Role;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id', foreignKeyConstraintName: 'fk_role_permissions_permission' })
  public permission: Permission;
}
