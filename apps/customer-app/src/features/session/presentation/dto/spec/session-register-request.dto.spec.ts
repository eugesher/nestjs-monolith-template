import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { SessionRegisterRequestDto } from '../session-register-request.dto';

describe('SessionRegisterRequestDto', () => {
  it('accepts an email and a password of 12 characters', () => {
    const dto = plainToInstance(SessionRegisterRequestDto, {
      email: 'eve@example.com',
      password: '123456789012',
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a malformed email', { email: 'eve', password: 'long-enough-password' }, 'email', 'isEmail'],
    [
      'an email longer than 255',
      { email: `${'a'.repeat(244)}@example.com`, password: 'long-enough-password' },
      'email',
      'maxLength',
    ],
    [
      'a password shorter than 12',
      { email: 'eve@example.com', password: '12345678901' },
      'password',
      'minLength',
    ],
    [
      'a password longer than 256',
      { email: 'eve@example.com', password: 'p'.repeat(257) },
      'password',
      'maxLength',
    ],
    [
      'a password that is not a string',
      { email: 'eve@example.com', password: 123456789012 },
      'password',
      'isString',
    ],
  ])('rejects %s', (_case, body, property, constraint) => {
    const dto = plainToInstance(SessionRegisterRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
