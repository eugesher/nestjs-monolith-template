import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { NoteGetRevisionsQueryDto } from '../note-get-revisions.query.dto';

describe('NoteGetRevisionsQueryDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(NoteGetRevisionsQueryDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers', () => {
    const dto = plainToInstance(NoteGetRevisionsQueryDto, { page: '3', limit: '10' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 3, limit: 10 });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['isPositive']],
    ['a word as the limit', { limit: 'ten' }, 'limit', ['isPositive', 'isInt']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(NoteGetRevisionsQueryDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
