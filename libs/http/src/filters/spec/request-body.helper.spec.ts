import { RequestBodyHelper } from '../request-body.helper';

describe('RequestBodyHelper', () => {
  describe('mask', () => {
    it('masks the password and the email and keeps the rest', () => {
      const masked = RequestBodyHelper.mask({
        email: 'a@b.c',
        password: 'p',
        name: 'Ann',
      });

      expect(masked).toEqual({
        email: '[REDACTED]',
        password: '[REDACTED]',
        name: 'Ann',
      });
    });

    it('masks the fields of nested objects and of arrays', () => {
      const masked = RequestBodyHelper.mask({
        user: { email: 'a@b.c', profile: { password: 'p', city: 'Oslo' } },
        users: [{ password: 'p', name: 'Ann' }, 'text'],
      });

      expect(masked).toEqual({
        user: { email: '[REDACTED]', profile: { password: '[REDACTED]', city: 'Oslo' } },
        users: [{ password: '[REDACTED]', name: 'Ann' }, 'text'],
      });
    });

    it('masks the objects of a body that is an array', () => {
      const masked = RequestBodyHelper.mask([{ password: 'p' }, 7]);

      expect(masked).toEqual([{ password: '[REDACTED]' }, 7]);
    });

    it('masks a field whatever its value', () => {
      const masked = RequestBodyHelper.mask({ password: { nested: 'p' }, email: null });

      expect(masked).toEqual({ password: '[REDACTED]', email: '[REDACTED]' });
    });

    it('does not change the body it was given', () => {
      const body = { password: 'p', user: { email: 'a@b.c' } };

      RequestBodyHelper.mask(body);

      expect(body).toEqual({ password: 'p', user: { email: 'a@b.c' } });
    });

    it.each([undefined, null, 'text', 7])('returns %p as is', (body) => {
      const masked = RequestBodyHelper.mask(body);

      expect(masked).toEqual(body);
    });
  });
});
