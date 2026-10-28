import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthPermissionsGuard } from '../auth-permissions.guard';

describe('AuthPermissionsGuard', () => {
  let getAllAndOverride: jest.Mock;
  let request: Record<string, unknown>;
  let context: ExecutionContext;
  let guard: AuthPermissionsGuard;

  beforeEach(() => {
    getAllAndOverride = jest.fn().mockReturnValue(['item:archive']);
    request = { user: { permissions: ['item:archive'] } };
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

  it('lets a route without required permissions through, even for an anonymous request', () => {
    getAllAndOverride.mockReturnValue(undefined);
    request = {};

    const allowed = guard.canActivate(context);

    expect(allowed).toBe(true);
  });

  it('refuses a user holding none of the required permissions with 403', () => {
    request = { user: { permissions: ['item:read'] } };

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('refuses an anonymous request on a gated route with 403', () => {
    request = {};

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
