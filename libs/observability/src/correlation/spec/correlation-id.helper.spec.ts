import { PinoLogger } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';

import { CorrelationIdHelper } from '../correlation-id.helper';

describe('CorrelationIdHelper', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Object.assign(PinoLogger, { root: undefined });
  });

  describe('resolve', () => {
    it('honors an inbound id and echoes it on the response', () => {
      const req = {
        headers: { 'x-correlation-id': 'c0ffee00-0000-4000-8000-000000000001' },
      } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() };

      const id = CorrelationIdHelper.resolve(req, res as unknown as ServerResponse);

      expect(id).toBe('c0ffee00-0000-4000-8000-000000000001');
      expect(res.setHeader).toHaveBeenCalledWith(
        'x-correlation-id',
        'c0ffee00-0000-4000-8000-000000000001',
      );
    });

    it.each([{}, { 'x-correlation-id': '' }])(
      'mints an id for headers %j without a warning and writes it back onto the request',
      (headers) => {
        const root = new PinoLogger({ pinoHttp: { enabled: false } }).logger;
        const warn = jest.spyOn(root, 'warn');
        const req = { headers } as unknown as IncomingMessage;
        const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

        Object.assign(PinoLogger, { root });

        const id = CorrelationIdHelper.resolve(req, res);

        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(req.headers['x-correlation-id']).toBe(id);
        expect(warn).not.toHaveBeenCalled();
      },
    );

    it.each(['inbound-id', 'c0ffee00-0000-4000-8000-0000000000011'])(
      'replaces the inbound id %p that is not a UUID and warns with its length',
      (inbound) => {
        const root = new PinoLogger({ pinoHttp: { enabled: false } }).logger;
        const warn = jest.spyOn(root, 'warn');
        const req = { headers: { 'x-correlation-id': inbound } } as unknown as IncomingMessage;
        const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

        Object.assign(PinoLogger, { root });

        const id = CorrelationIdHelper.resolve(req, res);

        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        expect(req.headers['x-correlation-id']).toBe(id);
        expect(warn).toHaveBeenCalledWith(
          { correlationId: id, inboundLength: inbound.length },
          'Invalid inbound correlationId: not a UUID, a new correlationId is minted',
        );
      },
    );

    it('still replaces an inbound id that is not a UUID when no logger module is up', () => {
      const req = { headers: { 'x-correlation-id': 'inbound-id' } } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

      const id = CorrelationIdHelper.resolve(req, res);

      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('is idempotent, so the middleware and the logger agree on one id', () => {
      const req = { headers: {} } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

      const first = CorrelationIdHelper.resolve(req, res);
      const second = CorrelationIdHelper.resolve(req, res);

      expect(second).toBe(first);
    });

    it('warns once when the middleware and the logger both resolve an inbound id that is not a UUID', () => {
      const root = new PinoLogger({ pinoHttp: { enabled: false } }).logger;
      const warn = jest.spyOn(root, 'warn');
      const req = { headers: { 'x-correlation-id': 'inbound-id' } } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

      Object.assign(PinoLogger, { root });

      const first = CorrelationIdHelper.resolve(req, res);
      const second = CorrelationIdHelper.resolve(req, res);

      expect(second).toBe(first);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('takes the first value of a repeated header', () => {
      const req = {
        headers: {
          'x-correlation-id': [
            'c0ffee00-0000-4000-8000-000000000002',
            'c0ffee00-0000-4000-8000-000000000003',
          ],
        },
      } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

      const id = CorrelationIdHelper.resolve(req, res);

      expect(id).toBe('c0ffee00-0000-4000-8000-000000000002');
    });

    it('does not touch a response whose headers are already sent', () => {
      const req = {
        headers: { 'x-correlation-id': 'c0ffee00-0000-4000-8000-000000000001' },
      } as unknown as IncomingMessage;
      const res = { headersSent: true, setHeader: jest.fn() };

      CorrelationIdHelper.resolve(req, res as unknown as ServerResponse);

      expect(res.setHeader).not.toHaveBeenCalled();
    });
  });
});
