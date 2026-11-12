import type { IncomingMessage, ServerResponse } from 'http';

import { CorrelationIdHelper } from '../correlation-id.helper';

describe('CorrelationIdHelper', () => {
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

    it.each([
      {},
      { 'x-correlation-id': '' },
      { 'x-correlation-id': 'inbound-id' },
      { 'x-correlation-id': 'c0ffee00-0000-4000-8000-0000000000011' },
    ])('mints an id for headers %j and writes it back onto the request', (headers) => {
      const req = { headers } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

      const id = CorrelationIdHelper.resolve(req, res);

      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(req.headers['x-correlation-id']).toBe(id);
    });

    it('is idempotent, so the middleware and the logger agree on one id', () => {
      const req = { headers: {} } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;

      const first = CorrelationIdHelper.resolve(req, res);
      const second = CorrelationIdHelper.resolve(req, res);

      expect(second).toBe(first);
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
