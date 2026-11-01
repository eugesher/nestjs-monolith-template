import { ClsServiceManager } from 'nestjs-cls';

import { CorrelationContextHelper } from '../correlation-context.helper';
import { CorrelationSetupConfig } from '../correlation-setup.config';

describe('CorrelationSetupConfig', () => {
  it('mounts a global context middleware on every route', () => {
    const config = new CorrelationSetupConfig();

    expect(config).toMatchObject({ global: true, middleware: { mount: true } });
  });

  it('opens the request context under the inbound correlation id and returns it in the response', async () => {
    const config = new CorrelationSetupConfig();
    const cls = ClsServiceManager.getClsService();
    const req = { headers: { 'x-correlation-id': 'inbound-id' } };
    const res = { headersSent: false, setHeader: jest.fn() };

    const current = await cls.run(async () => {
      await config.middleware.setup?.(cls, req, res);

      return CorrelationContextHelper.current('ItemController');
    });

    expect(current).toBe('inbound-id');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'inbound-id');
  });

  it('mints a correlation id for a request without one and puts it on the request', async () => {
    const config = new CorrelationSetupConfig();
    const cls = ClsServiceManager.getClsService();
    const req: { headers: Record<string, string> } = { headers: {} };
    const res = { headersSent: false, setHeader: jest.fn() };

    const current = await cls.run(async () => {
      await config.middleware.setup?.(cls, req, res);

      return CorrelationContextHelper.current('ItemController');
    });

    expect(current).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(req.headers['x-correlation-id']).toBe(current);
  });
});
