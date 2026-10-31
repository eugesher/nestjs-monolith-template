import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { NoteCreateRequestDto } from '../note-create-request.dto';

describe('NoteCreateRequestDto', () => {
  it.each([
    ['a note on a product', { subjectType: 'product', subjectId: '42', body: 'Refunded' }],
    [
      'a dashed subject type and the longest values',
      { subjectType: 'support-ticket', subjectId: 's'.repeat(64), body: 'b'.repeat(4000) },
    ],
  ])('accepts %s', (_case, body) => {
    const dto = plainToInstance(NoteCreateRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an uppercase subject type', 'Product'],
    ['a one-letter subject type', 'i'],
    ['a subject type with a digit', 'product2'],
    ['a subject type starting with a dash', '-product'],
  ])('rejects %s', (_case, subjectType) => {
    const dto = plainToInstance(NoteCreateRequestDto, {
      subjectType,
      subjectId: '42',
      body: 'Refunded',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('subjectType');
    expect(errors[0].constraints).toEqual({
      matches: 'subjectType must be lowercase letters and dashes',
    });
  });

  it.each([
    ['an empty subject id', '', ['minLength']],
    ['a subject id of 65 characters', 's'.repeat(65), ['maxLength']],
    ['a number as the subject id', 42, ['maxLength', 'minLength', 'isString']],
  ])('rejects %s', (_case, subjectId, constraints) => {
    const dto = plainToInstance(NoteCreateRequestDto, {
      subjectType: 'product',
      subjectId,
      body: 'Refunded',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('subjectId');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });

  it.each([
    ['an empty body', '', ['minLength']],
    ['a body of 4001 characters', 'b'.repeat(4001), ['maxLength']],
    ['a missing body', undefined, ['maxLength', 'minLength', 'isString']],
  ])('rejects %s', (_case, body, constraints) => {
    const dto = plainToInstance(NoteCreateRequestDto, {
      subjectType: 'product',
      subjectId: '42',
      body,
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('body');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
