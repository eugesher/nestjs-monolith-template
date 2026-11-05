import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ProductGetManyQueryDto } from '../product-get-many.query.dto';

describe('ProductGetManyQueryDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(ProductGetManyQueryDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers', () => {
    const dto = plainToInstance(ProductGetManyQueryDto, { page: '2', limit: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, limit: 500 });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['min']],
    ['a fractional limit', { limit: '1.5' }, 'limit', ['isInt']],
    ['a word as the page', { page: 'first' }, 'page', ['min', 'isInt']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(ProductGetManyQueryDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });

  it('accepts a tag id', () => {
    const dto = plainToInstance(ProductGetManyQueryDto, { tagId: '300' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['zero', '0'],
    ['a word', 'fragile'],
  ])('rejects %s as the tag id', (_case, tagId) => {
    const dto = plainToInstance(ProductGetManyQueryDto, { tagId });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({ matches: 'tagId must be a positive integer' });
  });
});
