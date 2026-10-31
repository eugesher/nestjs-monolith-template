import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { NoteEditRequestDto } from '../note-edit-request.dto';

describe('NoteEditRequestDto', () => {
  it('accepts a body of 4000 characters', () => {
    const dto = plainToInstance(NoteEditRequestDto, { body: 'b'.repeat(4000) });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an empty body', '', ['minLength']],
    ['a body of 4001 characters', 'b'.repeat(4001), ['maxLength']],
    ['a missing body', undefined, ['maxLength', 'minLength', 'isString']],
  ])('rejects %s', (_case, body, constraints) => {
    const dto = plainToInstance(NoteEditRequestDto, { body });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('body');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
