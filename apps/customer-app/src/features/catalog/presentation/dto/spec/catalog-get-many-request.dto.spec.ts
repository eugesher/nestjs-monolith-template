import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { CatalogGetManyRequestDto } from '../catalog-get-many-request.dto';

describe('CatalogGetManyRequestDto', () => {
  it('accepts an empty query string', () => {
    const dto = plainToInstance(CatalogGetManyRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the page window of the query string into numbers', () => {
    const dto = plainToInstance(CatalogGetManyRequestDto, { page: '2', size: '50' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, size: 50 });
  });

  it('leaves a size above 100 to the use case, which caps it', () => {
    const dto = plainToInstance(CatalogGetManyRequestDto, { size: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a page of zero', { page: '0' }, 'page', 'min'],
    ['a page that is not a number', { page: 'first' }, 'page', 'isInt'],
    ['a fractional size', { size: '2.5' }, 'size', 'isInt'],
    ['a size of zero', { size: '0' }, 'size', 'min'],
  ])('rejects %s', (_case, query, property, constraint) => {
    const dto = plainToInstance(CatalogGetManyRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
