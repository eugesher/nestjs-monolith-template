import { ClsModule, ClsServiceManager, type ClsModuleOptions } from 'nestjs-cls';

import { CorrelationContextHelper } from '@acme-libs/observability';

import { LocalStorageSetupModule } from '../local-storage-setup.module';

describe('LocalStorageSetupModule', () => {
  let forRoot: jest.SpyInstance;

  beforeEach(() => {
    forRoot = jest.spyOn(ClsModule, 'forRoot');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mounts a global context middleware on every route', () => {
    LocalStorageSetupModule.forRoot();
    const [options] = forRoot.mock.calls[0] as [ClsModuleOptions];

    expect(options).toMatchObject({ global: true, middleware: { mount: true } });
  });

  it('opens the request context under the inbound correlation id and returns it in the response', async () => {
    LocalStorageSetupModule.forRoot();
    const [options] = forRoot.mock.calls[0] as [ClsModuleOptions];
    const cls = ClsServiceManager.getClsService();
    const req = { headers: { 'x-correlation-id': 'c0ffee00-0000-4000-8000-000000000001' } };
    const res = { headersSent: false, setHeader: jest.fn() };

    const current = await cls.run(async () => {
      await options.middleware?.setup?.(cls, req, res);

      return CorrelationContextHelper.current('ItemController');
    });

    expect(current).toBe('c0ffee00-0000-4000-8000-000000000001');
    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      'c0ffee00-0000-4000-8000-000000000001',
    );
  });

  it('mints a correlation id for a request without one and puts it on the request', async () => {
    LocalStorageSetupModule.forRoot();
    const [options] = forRoot.mock.calls[0] as [ClsModuleOptions];
    const cls = ClsServiceManager.getClsService();
    const req: { headers: Record<string, string> } = { headers: {} };
    const res = { headersSent: false, setHeader: jest.fn() };

    const current = await cls.run(async () => {
      await options.middleware?.setup?.(cls, req, res);

      return CorrelationContextHelper.current('ItemController');
    });

    expect(current).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(req.headers['x-correlation-id']).toBe(current);
  });
});
