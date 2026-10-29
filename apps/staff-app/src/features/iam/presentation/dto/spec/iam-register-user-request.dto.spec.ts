import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { IamRegisterUserRequestDto } from '../iam-register-user-request.dto';

describe('IamRegisterUserRequestDto', () => {
  it('accepts an email, a long password and known roles', () => {
    const dto = plainToInstance(IamRegisterUserRequestDto, {
      email: 'ann@example.com',
      password: 'long-enough-password',
      roles: ['editor', 'viewer'],
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('accepts an empty role list', () => {
    const dto = plainToInstance(IamRegisterUserRequestDto, {
      email: 'ann@example.com',
      password: 'long-enough-password',
      roles: [],
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    [
      'a malformed email',
      { email: 'ann', password: 'long-enough-password', roles: [] },
      'email',
      'isEmail',
    ],
    [
      'a password shorter than 12',
      { email: 'ann@example.com', password: 'short-pass1', roles: [] },
      'password',
      'minLength',
    ],
    [
      'a password that is not a string',
      { email: 'ann@example.com', password: 123456789012, roles: [] },
      'password',
      'isString',
    ],
    [
      'roles that are not a list',
      { email: 'ann@example.com', password: 'long-enough-password', roles: 'editor' },
      'roles',
      'isArray',
    ],
    [
      'an unknown role',
      { email: 'ann@example.com', password: 'long-enough-password', roles: ['root'] },
      'roles',
      'isEnum',
    ],
  ])('rejects %s', (_case, body, property, constraint) => {
    const dto = plainToInstance(IamRegisterUserRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
