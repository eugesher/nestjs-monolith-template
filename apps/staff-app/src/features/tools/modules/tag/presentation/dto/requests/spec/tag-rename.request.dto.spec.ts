import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TagRenameRequestDto } from '../tag-rename.request.dto';

describe('TagRenameRequestDto', () => {
  it.each([
    ['a one-character name', 'a'],
    ['a name of 64 characters', 'a'.repeat(64)],
  ])('accepts %s', (_case, name) => {
    const dto = plainToInstance(TagRenameRequestDto, { name });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a missing name', {}, ['maxLength', 'minLength', 'isString']],
    ['an empty name', { name: '' }, ['minLength']],
    ['a name of 65 characters', { name: 'a'.repeat(65) }, ['maxLength']],
    ['a number as the name', { name: 7 }, ['maxLength', 'minLength', 'isString']],
  ])('rejects %s', (_case, body, constraints) => {
    const dto = plainToInstance(TagRenameRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
