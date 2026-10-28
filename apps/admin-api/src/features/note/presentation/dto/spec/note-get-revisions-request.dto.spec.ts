import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { NoteGetRevisionsRequestDto } from '../note-get-revisions-request.dto';

describe('NoteGetRevisionsRequestDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(NoteGetRevisionsRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers', () => {
    const dto = plainToInstance(NoteGetRevisionsRequestDto, { page: '3', size: '10' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 3, size: 10 });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['min']],
    ['a word as the size', { size: 'ten' }, 'size', ['min', 'isInt']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(NoteGetRevisionsRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
