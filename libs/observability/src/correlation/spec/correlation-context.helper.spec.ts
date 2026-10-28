import { PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '../correlation-context.helper';

describe('CorrelationContextHelper', () => {
  afterEach(() => {
    Object.assign(PinoLogger, { root: undefined });
  });

  describe('run', () => {
    it('binds the inbound id to the context and to the logger of everything the callback logs', async () => {
      Object.assign(PinoLogger, { root: new PinoLogger({ pinoHttp: { enabled: false } }).logger });

      const bindings = await CorrelationContextHelper.run('inbound-id', () =>
        Promise.resolve({
          current: CorrelationContextHelper.current('ItemArchiveUseCase'),
          logged: new PinoLogger({}).logger.bindings(),
        }),
      );

      expect(bindings).toEqual({
        current: 'inbound-id',
        logged: { correlationId: 'inbound-id' },
      });
    });

    it.each([undefined, ''])('mints an id when the message carries %p', async (inbound) => {
      Object.assign(PinoLogger, { root: new PinoLogger({ pinoHttp: { enabled: false } }).logger });

      const bindings = await CorrelationContextHelper.run(inbound, () =>
        Promise.resolve({
          current: CorrelationContextHelper.current('ItemArchiveUseCase'),
          logged: new PinoLogger({}).logger.bindings(),
        }),
      );

      expect(bindings.current).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      expect(bindings.logged).toEqual({ correlationId: bindings.current });
    });

    it('still binds the id when no logger module is up', async () => {
      const current = await CorrelationContextHelper.run('inbound-id', () =>
        Promise.resolve(CorrelationContextHelper.current('ItemArchiveUseCase')),
      );

      expect(current).toBe('inbound-id');
    });
  });

  describe('current', () => {
    it('keeps the id of its own context across awaits of concurrent contexts', async () => {
      const ids = await Promise.all(
        ['c-1', 'c-2'].map((inbound) =>
          CorrelationContextHelper.run(inbound, async () => {
            await new Promise((resolve) => setImmediate(resolve));

            return CorrelationContextHelper.current('ItemArchiveUseCase');
          }),
        ),
      );

      expect(ids).toEqual(['c-1', 'c-2']);
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
