import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthPermissionsGuard } from '../auth-permissions.guard';

describe('AuthPermissionsGuard', () => {
  let getAllAndOverride: jest.Mock;
  let request: Record<string, unknown>;
  let context: ExecutionContext;
  let guard: AuthPermissionsGuard;

  beforeEach(() => {
    getAllAndOverride = jest.fn().mockReturnValue(['product:write']);
    request = { user: { id: 'user-1', permissionCodes: ['product:write'] } };
    context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    guard = new AuthPermissionsGuard({ getAllAndOverride } as unknown as Reflector);
  });

  it('admits a user holding a required permission', () => {
    const allowed = guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith('auth:permissions', ['handler', 'class']);
  });

  it('lets a route without required permissions through', () => {
    getAllAndOverride.mockReturnValue(undefined);
    request = {};

    const allowed = guard.canActivate(context);

    expect(allowed).toBe(true);
  });

  it('refuses a user holding none of the required permissions with 403', () => {
    request = { user: { id: 'user-1', permissionCodes: ['product:read'] } };

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('refuses a user whose validator gave no permissions with 403', () => {
    request = { user: { id: 'user-1' } };

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('refuses an anonymous request on a gated route with 403', () => {
    request = {};

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
