import { LedgerListEntriesUseCase } from '../../../application';
import { LedgerController } from '../ledger.controller';

describe('LedgerController', () => {
  let list: jest.Mock;
  let controller: LedgerController;

  beforeEach(() => {
    list = jest.fn();
    controller = new LedgerController(new LedgerListEntriesUseCase({ list }));
  });

  describe('handleList', () => {
    it('answers the page for the filters of the query string', async () => {
      list.mockResolvedValue({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });

      const response = await controller.handleList({ subjectType: 'product', subjectId: '12' });

      expect(response).toEqual({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });
      expect(list).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        offset: 0,
        subjectType: 'product',
        subjectId: '12',
        correlationId: undefined,
      });
    });
  });
});
