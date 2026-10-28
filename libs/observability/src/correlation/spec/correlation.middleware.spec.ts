import { IncomingMessage, ServerResponse } from 'http';

import { CorrelationContextHelper } from '../correlation-context.helper';
import { CorrelationMiddleware } from '../correlation.middleware';

describe('CorrelationMiddleware', () => {
  describe('use', () => {
    it('serves the rest of the request in the context of its correlation id', () => {
      const req = { headers: { 'x-correlation-id': 'inbound-id' } } as unknown as IncomingMessage;
      const res = { headersSent: false, setHeader: jest.fn() } as unknown as ServerResponse;
      const next = jest.fn(() => CorrelationContextHelper.current('ItemController'));

      new CorrelationMiddleware().use(req, res, next);

      expect(next).toHaveReturnedWith('inbound-id');
    });
  });
});
