import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { NoteGetManyRequestDto } from '../note-get-many-request.dto';

describe('NoteGetManyRequestDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(NoteGetManyRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers and a boolean and keeps the subject', () => {
    const dto = plainToInstance(NoteGetManyRequestDto, {
      page: '2',
      size: '500',
      subjectType: 'product',
      subjectId: '42',
      resolved: 'false',
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({
      page: 2,
      size: 500,
      subjectType: 'product',
      subjectId: '42',
      resolved: false,
    });
  });

  it('turns resolved=true into true', () => {
    const dto = plainToInstance(NoteGetManyRequestDto, { resolved: 'true' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ resolved: true });
  });

  it('leaves half of the subject to the use case', () => {
    const dto = plainToInstance(NoteGetManyRequestDto, { subjectType: 'product' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['min']],
    ['a fractional size', { size: '1.5' }, 'size', ['isInt']],
    ['an uppercase subject type', { subjectType: 'Product' }, 'subjectType', ['matches']],
    ['an empty subject id', { subjectId: '' }, 'subjectId', ['minLength']],
    ['a subject id of 65 characters', { subjectId: 's'.repeat(65) }, 'subjectId', ['maxLength']],
    ['resolved=yes', { resolved: 'yes' }, 'resolved', ['isBoolean']],
    ['resolved=1', { resolved: '1' }, 'resolved', ['isBoolean']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(NoteGetManyRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
