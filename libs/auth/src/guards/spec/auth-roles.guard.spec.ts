import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthRolesGuard } from '../auth-roles.guard';

describe('AuthRolesGuard', () => {
  let getAllAndOverride: jest.Mock;
  let request: Record<string, unknown>;
  let context: ExecutionContext;
  let guard: AuthRolesGuard;

  beforeEach(() => {
    getAllAndOverride = jest.fn().mockReturnValue(['admin']);
    request = { user: { roles: ['admin'] } };
    context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    guard = new AuthRolesGuard({ getAllAndOverride } as unknown as Reflector);
  });

  it('admits a user holding a required role', () => {
    const allowed = guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith('auth:roles', ['handler', 'class']);
  });

  it('lets a route without required roles through, even for an anonymous request', () => {
    getAllAndOverride.mockReturnValue(undefined);
    request = {};

    const allowed = guard.canActivate(context);

    expect(allowed).toBe(true);
  });

  it('refuses a user holding none of the required roles with 403', () => {
    request = { user: { roles: ['viewer'] } };

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('refuses an anonymous request on a gated route with 403', () => {
    request = {};

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
