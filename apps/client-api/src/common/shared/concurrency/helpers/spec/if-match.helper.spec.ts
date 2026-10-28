import { BadRequestException } from '@nestjs/common';

import { IfMatchHelper } from '../if-match.helper';

describe('IfMatchHelper', () => {
  describe('parse', () => {
    it.each([
      ['a missing header', undefined],
      ['a repeated header', ['3', '4']],
      ['an empty header', ''],
      ['a blank header', '   '],
      ['an empty quoted header', '""'],
    ])('answers undefined for %s', (_case, header) => {
      const version = IfMatchHelper.parse(header);

      expect(version).toBeUndefined();
    });

    it.each([
      ['a bare version', '3', 3],
      ['a quoted version', '"3"', 3],
      ['a padded version', '  7 ', 7],
      ['version zero', '0', 0],
    ])('reads %s', (_case, header, expected) => {
      const version = IfMatchHelper.parse(header);

      expect(version).toBe(expected);
    });

    it.each([
      ['a word', 'not-a-number'],
      ['a negative version', '-1'],
      ['a fraction', '1.5'],
      ['a weak tag', 'W/"3"'],
    ])('refuses %s with a 400 IF_MATCH_INVALID', (_case, header) => {
      const parse = (): unknown => IfMatchHelper.parse(header);

      expect(parse).toThrow(BadRequestException);
      expect(parse).toThrow(
        expect.objectContaining({
          response: {
            statusCode: 400,
            message: 'The If-Match header must be a non-negative integer version',
            code: 'IF_MATCH_INVALID',
          },
        }) as Error,
      );
    });
  });
});
