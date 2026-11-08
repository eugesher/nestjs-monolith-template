import { AppE2EContext } from '../../context/app-e2e.context';
import { PermissionE2E } from './modules/permission.e2e';
import { RoleE2E } from './modules/role.e2e';
import { UserE2E } from './modules/user.e2e';

export class AccessE2E {
  private constructor(
    private readonly permissionE2E: PermissionE2E,
    private readonly roleE2E: RoleE2E,
    private readonly userE2E: UserE2E,
  ) {}

  public static of(ctx: AppE2EContext): AccessE2E {
    return new AccessE2E(PermissionE2E.of(ctx), RoleE2E.of(ctx), UserE2E.of(ctx));
  }

  public execute(): void {
    describe('Permission', () => {
      this.permissionE2E.handleList();
    });

    describe('Role', () => {
      this.roleE2E.handleList();
      this.roleE2E.handleCreate();
      this.roleE2E.handleReassignPermissions();
    });

    describe('User', () => {
      this.userE2E.handleRegister();
      this.userE2E.handleReassignRoles();
    });
  }
}
