import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import type { INestApplication } from '@nestjs/common';

import { AppNameEnum } from '@acme-libs/kernel';
import { ApiReference } from '@acme-libs/openapi';

import { AppBootstrap } from '../app-bootstrap';

describe('AppBootstrap', () => {
  let log: jest.Mock;
  let app: {
    get: jest.Mock;
    useLogger: jest.Mock;
    setGlobalPrefix: jest.Mock;
    enableShutdownHooks: jest.Mock;
    listen: jest.Mock;
  };
  let setupReference: jest.SpyInstance;

  beforeEach(() => {
    log = jest.fn();
    app = {
      get: jest.fn((token: unknown) =>
        token === ConfigService
          ? { getOrThrow: (key: string) => ({ PORT: 3000, API_PREFIX: 'api' })[key] }
          : { log },
      ),
      useLogger: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableShutdownHooks: jest.fn(),
      listen: jest.fn(),
    };
    setupReference = jest.spyOn(ApiReference, 'setup').mockReturnValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('starts the app on the port of its config, behind its prefix', async () => {
      const bootstrap = AppBootstrap.create(
        app as unknown as INestApplication,
        AppNameEnum.STAFF_APP,
      );

      await bootstrap.execute();

      expect(app.get).toHaveBeenCalledWith(Logger);
      expect(app.useLogger).toHaveBeenCalledWith({ log });
      expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
      expect(app.enableShutdownHooks).toHaveBeenCalled();
      expect(setupReference).toHaveBeenCalledWith(app, 'staff-app');
      expect(app.listen).toHaveBeenCalledWith(3000);
      expect(log).toHaveBeenCalledWith('staff-app is listening on port 3000');
    });

    it('rejects without the port line when listen fails', async () => {
      const failure = new Error('listen EADDRINUSE');
      app.listen.mockRejectedValue(failure);
      const bootstrap = AppBootstrap.create(
        app as unknown as INestApplication,
        AppNameEnum.PROCESSOR_APP,
      );

      await expect(bootstrap.execute()).rejects.toBe(failure);

      expect(log).not.toHaveBeenCalled();
    });
  });
});
