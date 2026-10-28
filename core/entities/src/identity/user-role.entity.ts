import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Role } from './role.entity';
import { User } from './user.entity';

@Entity({ name: 'user_roles' })
export class UserRole {
  @PrimaryColumn({ type: 'char', length: 36 })
  public userId: string;

  @PrimaryColumn({ type: 'int' })
  public roleId: number;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_roles_user' })
  public user: User;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id', foreignKeyConstraintName: 'fk_user_roles_role' })
  public role: Role;
}
