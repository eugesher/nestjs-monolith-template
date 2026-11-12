import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { PageQueryDto } from '../page.query.dto';

describe('PageQueryDto', () => {
  it('accepts an empty query string', () => {
    const dto = plainToInstance(PageQueryDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the page window of the query string into numbers', () => {
    const dto = plainToInstance(PageQueryDto, { page: '2', limit: '50' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, limit: 50 });
  });

  it('leaves a page above 1000 and a limit above 100 to the use case, which caps them', () => {
    const dto = plainToInstance(PageQueryDto, { page: '5000', limit: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 5000, limit: 500 });
  });

  it.each([
    ['a page of zero', { page: '0' }, 'page', ['isPositive']],
    ['a word as the page', { page: 'first' }, 'page', ['isPositive', 'isInt']],
    ['a fractional limit', { limit: '2.5' }, 'limit', ['isInt']],
    ['a limit of zero', { limit: '0' }, 'limit', ['isPositive']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(PageQueryDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
