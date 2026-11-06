import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { TagGetManyQueryDto } from '../tag-get-many.query.dto';

describe('TagGetManyQueryDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(TagGetManyQueryDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers', () => {
    const dto = plainToInstance(TagGetManyQueryDto, { page: '2', limit: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, limit: 500 });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['isPositive']],
    ['a fractional limit', { limit: '1.5' }, 'limit', ['isInt']],
    ['a word as the page', { page: 'first' }, 'page', ['isPositive', 'isInt']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(TagGetManyQueryDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
