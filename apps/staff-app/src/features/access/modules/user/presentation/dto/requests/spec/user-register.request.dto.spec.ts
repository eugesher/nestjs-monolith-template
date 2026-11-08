import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UserRegisterRequestDto } from '../user-register.request.dto';

describe('UserRegisterRequestDto', () => {
  it('accepts an email, a long password and role ids', () => {
    const dto = plainToInstance(UserRegisterRequestDto, {
      email: 'ann@example.com',
      password: 'long-enough-password',
      roleIds: ['2', '3'],
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('accepts an empty role list', () => {
    const dto = plainToInstance(UserRegisterRequestDto, {
      email: 'ann@example.com',
      password: 'long-enough-password',
      roleIds: [],
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    [
      'a malformed email',
      { email: 'ann', password: 'long-enough-password', roleIds: [] },
      'email',
      'isEmail',
    ],
    [
      'a password shorter than 12',
      { email: 'ann@example.com', password: 'short-pass1', roleIds: [] },
      'password',
      'minLength',
    ],
    [
      'a password that is not a string',
      { email: 'ann@example.com', password: 123456789012, roleIds: [] },
      'password',
      'isString',
    ],
    [
      'role ids that are not a list',
      { email: 'ann@example.com', password: 'long-enough-password', roleIds: '2' },
      'roleIds',
      'isArray',
    ],
    [
      'a role name',
      { email: 'ann@example.com', password: 'long-enough-password', roleIds: ['root'] },
      'roleIds',
      'matches',
    ],
  ])('rejects %s', (_case, body, property, constraint) => {
    const dto = plainToInstance(UserRegisterRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
