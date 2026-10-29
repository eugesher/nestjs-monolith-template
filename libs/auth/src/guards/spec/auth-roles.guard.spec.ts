import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthRolesGuard } from '../auth-roles.guard';

describe('AuthRolesGuard', () => {
  let findRoles: jest.Mock;
  let getAllAndOverride: jest.Mock;
  let request: Record<string, unknown>;
  let context: ExecutionContext;
  let guard: AuthRolesGuard;

  beforeEach(() => {
    findRoles = jest.fn().mockResolvedValue(['admin']);
    getAllAndOverride = jest.fn().mockReturnValue(['admin']);
    request = { user: { id: 'user-1' } };
    context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    guard = new AuthRolesGuard({ findRoles, findPermissionCodes: jest.fn() }, {
      getAllAndOverride,
    } as unknown as Reflector);
  });

  it('admits a user holding a required role, reading the roles once', async () => {
    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith('auth:roles', ['handler', 'class']);
    expect(findRoles).toHaveBeenCalledTimes(1);
    expect(findRoles).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('lets a route without required roles through without reading any roles', async () => {
    getAllAndOverride.mockReturnValue(undefined);
    request = {};

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(findRoles).not.toHaveBeenCalled();
  });

  it('refuses a user holding none of the required roles with 403', async () => {
    findRoles.mockResolvedValue(['viewer']);

    const allowed = guard.canActivate(context);

    await expect(allowed).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses an anonymous request on a gated route with 403 without reading any roles', async () => {
    request = {};

    const allowed = guard.canActivate(context);

    await expect(allowed).rejects.toBeInstanceOf(ForbiddenException);
    expect(findRoles).not.toHaveBeenCalled();
  });
});
