import { RequestBodyHelper } from '../request-body.helper';

describe('RequestBodyHelper', () => {
  describe('mask', () => {
    it('masks the secret fields and keeps the rest', () => {
      const masked = RequestBodyHelper.mask({
        email: 'a@b.c',
        password: 'p',
        currentPassword: 'c',
        newPassword: 'n',
        refreshToken: 't',
      });

      expect(masked).toEqual({
        email: 'a@b.c',
        password: '[REDACTED]',
        currentPassword: '[REDACTED]',
        newPassword: '[REDACTED]',
        refreshToken: '[REDACTED]',
      });
    });

    it('does not change the body it was given', () => {
      const body = { password: 'p' };

      RequestBodyHelper.mask(body);

      expect(body).toEqual({ password: 'p' });
    });

    it.each([undefined, null, 'text', 7, [{ password: 'p' }]])('returns %p as is', (body) => {
      const masked = RequestBodyHelper.mask(body);

      expect(masked).toEqual(body);
    });
  });
});
