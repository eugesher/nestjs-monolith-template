import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthPermissionsGuard } from '../auth-permissions.guard';

describe('AuthPermissionsGuard', () => {
  let findPermissionCodes: jest.Mock;
  let getAllAndOverride: jest.Mock;
  let request: Record<string, unknown>;
  let context: ExecutionContext;
  let guard: AuthPermissionsGuard;

  beforeEach(() => {
    findPermissionCodes = jest.fn().mockResolvedValue(['item:archive']);
    getAllAndOverride = jest.fn().mockReturnValue(['item:archive']);
    request = { user: { id: 'user-1' } };
    context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    guard = new AuthPermissionsGuard({ validate: jest.fn(), findPermissionCodes }, {
      getAllAndOverride,
    } as unknown as Reflector);
  });

  it('admits a user holding a required permission, reading the permissions once', async () => {
    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith('auth:permissions', ['handler', 'class']);
    expect(findPermissionCodes).toHaveBeenCalledTimes(1);
    expect(findPermissionCodes).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('lets a route without required permissions through without reading any permissions', async () => {
    getAllAndOverride.mockReturnValue(undefined);
    request = {};

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(findPermissionCodes).not.toHaveBeenCalled();
  });

  it('refuses a user holding none of the required permissions with 403', async () => {
    findPermissionCodes.mockResolvedValue(['item:read']);

    const allowed = guard.canActivate(context);

    await expect(allowed).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses an anonymous request on a gated route with 403 without reading any permissions', async () => {
    request = {};

    const allowed = guard.canActivate(context);

    await expect(allowed).rejects.toBeInstanceOf(ForbiddenException);
    expect(findPermissionCodes).not.toHaveBeenCalled();
  });
});
