import { CLS_ID, ClsServiceManager } from 'nestjs-cls';
import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '../correlation-context.helper';

describe('CorrelationContextHelper', () => {
  afterEach(() => {
    Object.assign(PinoLogger, { root: undefined });
  });

  describe('run', () => {
    it('binds the inbound id to the context of the callback', async () => {
      const current = await CorrelationContextHelper.run(
        'c0ffee00-0000-4000-8000-000000000001',
        () => Promise.resolve(CorrelationContextHelper.current('ItemArchiveUseCase')),
      );

      expect(current).toBe('c0ffee00-0000-4000-8000-000000000001');
    });

    it.each([undefined, '', 'inbound-id', 'c0ffee00-0000-4000-8000-0000000000011'])(
      'mints an id when the message carries %p',
      async (inbound) => {
        const current = await CorrelationContextHelper.run(inbound, () =>
          Promise.resolve(CorrelationContextHelper.current('ItemArchiveUseCase')),
        );

        expect(current).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
      },
    );

    it('opens a context of its own inside another context', async () => {
      const cls = ClsServiceManager.getClsService();

      const values = await cls.run(async () => {
        cls.set(CLS_ID, 'c0ffee00-0000-4000-8000-000000000002');
        cls.set('outer-key', 'outer-value');

        return await CorrelationContextHelper.run('c0ffee00-0000-4000-8000-000000000003', () =>
          Promise.resolve({
            current: CorrelationContextHelper.current('ItemArchiveUseCase'),
            outer: cls.get<string | undefined>('outer-key'),
          }),
        );
      });

      expect(values).toEqual({ current: 'c0ffee00-0000-4000-8000-000000000003', outer: undefined });
    });
  });

  describe('current', () => {
    it('keeps the id of its own context across awaits of concurrent contexts', async () => {
      const ids = await Promise.all(
        ['c0ffee00-0000-4000-8000-000000000004', 'c0ffee00-0000-4000-8000-000000000005'].map(
          (inbound) =>
            CorrelationContextHelper.run(inbound, async () => {
              await new Promise((resolve) => setImmediate(resolve));

              return CorrelationContextHelper.current('ItemArchiveUseCase');
            }),
        ),
      );

      expect(ids).toEqual([
        'c0ffee00-0000-4000-8000-000000000004',
        'c0ffee00-0000-4000-8000-000000000005',
      ]);
    });

    it('mints an id and warns with the caller context outside a correlation context', () => {
      const root = new PinoLogger({ pinoHttp: { enabled: false } }).logger;
      const warn = jest.spyOn(root, 'warn');

      Object.assign(PinoLogger, { root });

      const correlationId = CorrelationContextHelper.current('ItemArchiveUseCase');

      expect(correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(warn).toHaveBeenCalledWith(
        { context: 'ItemArchiveUseCase', correlationId },
        'No correlation context: the entry point does not open one, a new correlationId is minted',
      );
    });

    it('still mints an id outside a correlation context when no logger module is up', () => {
      const correlationId = CorrelationContextHelper.current('ItemArchiveUseCase');

      expect(correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });
  });
});
