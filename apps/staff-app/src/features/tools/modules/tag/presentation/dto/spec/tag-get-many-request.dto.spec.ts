import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TagGetManyRequestDto } from '../tag-get-many-request.dto';

describe('TagGetManyRequestDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(TagGetManyRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers', () => {
    const dto = plainToInstance(TagGetManyRequestDto, { page: '2', limit: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, limit: 500 });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['min']],
    ['a fractional limit', { limit: '1.5' }, 'limit', ['isInt']],
    ['a word as the page', { page: 'first' }, 'page', ['min', 'isInt']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(TagGetManyRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
