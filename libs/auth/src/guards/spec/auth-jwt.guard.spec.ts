import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { AuthJwtGuard } from '../auth-jwt.guard';

describe('AuthJwtGuard', () => {
  let validate: jest.Mock;
  let verifyAsync: jest.Mock;
  let getAllAndOverride: jest.Mock;
  let request: Record<string, unknown>;
  let context: ExecutionContext;
  let guard: AuthJwtGuard;

  beforeEach(() => {
    validate = jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'ann@example.com',
      roles: ['admin'],
      permissions: ['item:archive'],
    });
    verifyAsync = jest.fn().mockResolvedValue({ sub: 'user-1', roles: ['ignored'] });
    getAllAndOverride = jest.fn().mockReturnValue(undefined);
    request = { headers: { authorization: 'Bearer token' } };
    context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    guard = new AuthJwtGuard(
      { validate },
      { verifyAsync } as unknown as JwtService,
      { getAllAndOverride } as unknown as Reflector,
    );
  });

  it('lets a valid token of an active user in and puts the re-derived user on the request', async () => {
    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith('token');
    expect(validate).toHaveBeenCalledWith({ sub: 'user-1' });
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'ann@example.com',
      roles: ['admin'],
      permissions: ['item:archive'],
    });
  });

  it('lets a public route in without looking at the token', async () => {
    getAllAndOverride.mockReturnValue(true);
    request.headers = {};

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith('auth:public', ['handler', 'class']);
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('accepts the bearer scheme in any case', async () => {
    request.headers = { authorization: 'bEaReR token' };

    const allowed = await guard.canActivate(context);

    expect(allowed).toBe(true);
  });

  it.each([
    ['no authorization header', {}],
    ['another scheme', { authorization: 'Basic token' }],
    ['a scheme without a token', { authorization: 'Bearer' }],
  ])('rejects %s with 401', async (_, headers) => {
    request.headers = headers;

    const allowed = guard.canActivate(context);

    await expect(allowed).rejects.toBeInstanceOf(UnauthorizedException);
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a token that does not verify with 401', async () => {
    verifyAsync.mockRejectedValue(new Error('jwt expired'));

    const allowed = guard.canActivate(context);

    await expect(allowed).rejects.toBeInstanceOf(UnauthorizedException);
    expect(validate).not.toHaveBeenCalled();
  });

  it('rejects a user that is gone or disabled with 401', async () => {
    validate.mockResolvedValue(undefined);

    const allowed = guard.canActivate(context);

    await expect(allowed).rejects.toBeInstanceOf(UnauthorizedException);
    expect(request.user).toBeUndefined();
  });
});
