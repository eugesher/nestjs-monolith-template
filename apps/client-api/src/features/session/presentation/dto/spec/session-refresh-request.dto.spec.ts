import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { SessionRefreshRequestDto } from '../session-refresh-request.dto';

describe('SessionRefreshRequestDto', () => {
  it('accepts a refresh token', () => {
    const dto = plainToInstance(SessionRefreshRequestDto, { refreshToken: 'refresh-1' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a missing refresh token', {}],
    ['a refresh token that is not a string', { refreshToken: 42 }],
  ])('rejects %s', (_case, body) => {
    const dto = plainToInstance(SessionRefreshRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('refreshToken');
    expect(errors[0].constraints).toEqual({ isString: 'refreshToken must be a string' });
  });
});
