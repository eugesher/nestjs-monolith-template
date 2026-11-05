import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ProductTagsReplaceRequestDto } from '../product-tags-replace.request.dto';

describe('ProductTagsReplaceRequestDto', () => {
  it.each([
    ['a list of tag ids', ['300', '18446744073709551615']],
    ['an empty list', []],
  ])('accepts %s', (_case, tagIds) => {
    const dto = plainToInstance(ProductTagsReplaceRequestDto, { tagIds });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a missing list', {}, ['isArray']],
    ['a string instead of a list', { tagIds: '300' }, ['isArray']],
    ['a word among the ids', { tagIds: ['300', 'fragile'] }, ['matches']],
    [
      '21 ids',
      { tagIds: Array.from({ length: 21 }, (_, index) => String(index + 1)) },
      ['arrayMaxSize'],
    ],
  ])('rejects %s', (_case, body, constraints) => {
    const dto = plainToInstance(ProductTagsReplaceRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(expect.arrayContaining(constraints));
  });
});
