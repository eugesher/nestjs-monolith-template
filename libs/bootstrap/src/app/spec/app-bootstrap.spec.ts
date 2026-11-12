import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger, type PinoLogger } from 'nestjs-pino';
import type { INestApplication } from '@nestjs/common';

import { AppNameEnum } from '@acme-libs/kernel';
import { BootstrapLogger } from '@acme-libs/observability';
import { ApiReference } from '@acme-libs/openapi';

import { AppBootstrap } from '../app-bootstrap';

describe('AppBootstrap', () => {
  class AppModule {}

  let info: jest.Mock;
  let error: jest.Mock;
  let app: {
    get: jest.Mock;
    useLogger: jest.Mock;
    setGlobalPrefix: jest.Mock;
    enableShutdownHooks: jest.Mock;
    listen: jest.Mock;
  };
  let setupLogger: jest.SpyInstance;
  let create: jest.SpyInstance;
  let setupReference: jest.SpyInstance;
  let exit: jest.SpyInstance;

  beforeEach(() => {
    info = jest.fn();
    error = jest.fn();
    setupLogger = jest
      .spyOn(BootstrapLogger, 'setup')
      .mockReturnValue({ info, error } as unknown as PinoLogger);
    app = {
      get: jest.fn((token: unknown) =>
        token === ConfigService
          ? { getOrThrow: (key: string) => ({ PORT: 3000, API_PREFIX: 'api' })[key] }
          : 'app-logger',
      ),
      useLogger: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableShutdownHooks: jest.fn(),
      listen: jest.fn(),
    };
    create = jest
      .spyOn(NestFactory, 'create')
      .mockResolvedValue(app as unknown as INestApplication);
    setupReference = jest.spyOn(ApiReference, 'setup').mockReturnValue();
    exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('run', () => {
    it('starts the app on the port of its config, behind its prefix', async () => {
      await AppBootstrap.run(AppModule, AppNameEnum.STAFF_APP);

      expect(setupLogger).toHaveBeenCalledWith('staff-app');
      expect(create).toHaveBeenCalledWith(AppModule, { bufferLogs: true });
      expect(app.get).toHaveBeenCalledWith(Logger);
      expect(app.useLogger).toHaveBeenCalledWith('app-logger');
      expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
      expect(app.enableShutdownHooks).toHaveBeenCalled();
      expect(setupReference).toHaveBeenCalledWith(app, 'staff-app');
      expect(app.listen).toHaveBeenCalledWith(3000);
      expect(info).toHaveBeenCalledWith('staff-app is listening on port 3000');
      expect(exit).not.toHaveBeenCalled();
    });

    it('logs a failed start and exits with 1', async () => {
      const failure = new Error('connect ECONNREFUSED');
      create.mockRejectedValue(failure);

      await AppBootstrap.run(AppModule, AppNameEnum.PROCESSOR_APP);

      expect(error).toHaveBeenCalledWith(failure, 'processor-app bootstrap error');
      expect(exit).toHaveBeenCalledWith(1);
      expect(info).not.toHaveBeenCalled();
    });
  });
});
