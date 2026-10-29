import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ItemRenameRequestDto } from '../item-rename-request.dto';

describe('ItemRenameRequestDto', () => {
  it('accepts a name of 255 characters', () => {
    const dto = plainToInstance(ItemRenameRequestDto, { name: 'n'.repeat(255) });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an empty name', '', ['minLength']],
    ['a name of 256 characters', 'n'.repeat(256), ['maxLength']],
    ['a number', 7, ['maxLength', 'minLength', 'isString']],
  ])('rejects %s', (_case, name, constraints) => {
    const dto = plainToInstance(ItemRenameRequestDto, { name });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
