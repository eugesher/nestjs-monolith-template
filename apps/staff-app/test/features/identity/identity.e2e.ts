import { AppE2EContext } from '../../context/app-e2e.context';
import { AuthE2E } from './modules/auth.e2e';
import { RoleE2E } from './modules/role.e2e';
import { UserE2E } from './modules/user.e2e';

export class IdentityE2E {
  private constructor(
    private readonly authE2E: AuthE2E,
    private readonly roleE2E: RoleE2E,
    private readonly userE2E: UserE2E,
  ) {}

  public static of(ctx: AppE2EContext): IdentityE2E {
    return new IdentityE2E(AuthE2E.of(ctx), RoleE2E.of(ctx), UserE2E.of(ctx));
  }

  public execute(): void {
    describe('Auth', () => {
      this.authE2E.handleLogin();
      this.authE2E.handleMe();
    });

    describe('Role', () => {
      this.roleE2E.handleList();
      this.roleE2E.handleUpdatePermissions();
    });

    describe('User', () => {
      this.userE2E.handleRegister();
      this.userE2E.handleAssignRole();
    });
  }
}
