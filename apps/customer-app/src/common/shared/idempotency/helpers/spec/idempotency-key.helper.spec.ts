import { BadRequestException } from '@nestjs/common';

import { IdempotencyKeyHelper } from '../idempotency-key.helper';

describe('IdempotencyKeyHelper', () => {
  describe('parse', () => {
    it('answers the trimmed key', () => {
      const key = IdempotencyKeyHelper.parse('  replayed-key-0001 ');

      expect(key).toBe('replayed-key-0001');
    });

    it('accepts a key of exactly 128 characters', () => {
      const key = IdempotencyKeyHelper.parse('k'.repeat(128));

      expect(key).toHaveLength(128);
    });

    it.each([
      ['a missing header', undefined],
      ['a repeated header', ['a', 'b']],
      ['an empty header', ''],
      ['a blank header', '   '],
    ])('refuses %s with a 400 IDEMPOTENCY_KEY_REQUIRED', (_case, header) => {
      const parse = (): unknown => IdempotencyKeyHelper.parse(header);

      expect(parse).toThrow(BadRequestException);
      expect(parse).toThrow(
        expect.objectContaining({
          response: {
            statusCode: 400,
            message: 'The Idempotency-Key header is required for this operation',
            code: 'IDEMPOTENCY_KEY_REQUIRED',
          },
        }) as Error,
      );
    });

    it('refuses a key longer than 128 characters with a 400 IDEMPOTENCY_KEY_INVALID', () => {
      const parse = (): unknown => IdempotencyKeyHelper.parse('k'.repeat(129));

      expect(parse).toThrow(BadRequestException);
      expect(parse).toThrow(
        expect.objectContaining({
          response: {
            statusCode: 400,
            message: 'The Idempotency-Key header must be at most 128 characters',
            code: 'IDEMPOTENCY_KEY_INVALID',
          },
        }) as Error,
      );
    });
  });
});
