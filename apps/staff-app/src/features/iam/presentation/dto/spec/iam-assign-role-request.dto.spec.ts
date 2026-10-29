import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { IamAssignRoleRequestDto } from '../iam-assign-role-request.dto';

describe('IamAssignRoleRequestDto', () => {
  it('accepts a known role', () => {
    const dto = plainToInstance(IamAssignRoleRequestDto, { role: 'viewer' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an unknown role', { role: 'root' }],
    ['a missing role', {}],
  ])('rejects %s', (_case, body) => {
    const dto = plainToInstance(IamAssignRoleRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('role');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(['isEnum']);
  });
});
