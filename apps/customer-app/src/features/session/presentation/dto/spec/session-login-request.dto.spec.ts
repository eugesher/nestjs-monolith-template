import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { SessionLoginRequestDto } from '../session-login-request.dto';

describe('SessionLoginRequestDto', () => {
  it('accepts an email and a password', () => {
    const dto = plainToInstance(SessionLoginRequestDto, {
      email: 'ann@example.com',
      password: 'secret',
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a malformed email', { email: 'ann', password: 'secret' }, 'email', 'isEmail'],
    [
      'an email longer than 255',
      { email: `${'a'.repeat(244)}@example.com`, password: 'secret' },
      'email',
      'maxLength',
    ],
    ['an empty password', { email: 'ann@example.com', password: '' }, 'password', 'minLength'],
    [
      'a password longer than 256',
      { email: 'ann@example.com', password: 'p'.repeat(257) },
      'password',
      'maxLength',
    ],
    [
      'a password that is not a string',
      { email: 'ann@example.com', password: 42 },
      'password',
      'isString',
    ],
  ])('rejects %s', (_case, body, property, constraint) => {
    const dto = plainToInstance(SessionLoginRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });

  it('rejects a body without credentials on both fields', () => {
    const dto = plainToInstance(SessionLoginRequestDto, {});

    const errors = validateSync(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toEqual(['email', 'password']);
  });
});
