import fs from 'fs';

import { TlsHelper } from '../tls.helper';

describe('TlsHelper', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('options', () => {
    it('reads the certificate authority from the path', () => {
      const readFileSync = jest
        .spyOn(fs, 'readFileSync')
        .mockReturnValue('-----BEGIN CERTIFICATE-----');

      const options = TlsHelper.options('/run/secrets/ca.pem');

      expect(options).toEqual({ ca: '-----BEGIN CERTIFICATE-----' });
      expect(readFileSync).toHaveBeenCalledWith('/run/secrets/ca.pem', 'utf8');
    });

    it('turns TLS off for an empty path', () => {
      const readFileSync = jest.spyOn(fs, 'readFileSync');

      const options = TlsHelper.options('');

      expect(options).toBeUndefined();
      expect(readFileSync).not.toHaveBeenCalled();
    });

    it('fails when the file cannot be read', () => {
      const options = (): unknown => TlsHelper.options('/missing/ca.pem');

      expect(options).toThrow('ENOENT');
    });
  });
});
