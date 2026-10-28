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
      list.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });

      const response = await controller.handleList({ subjectType: 'item', subjectId: '12' });

      expect(response).toEqual({ items: [], total: 0, page: 1, size: 20 });
      expect(list).toHaveBeenCalledWith({
        page: undefined,
        size: undefined,
        subjectType: 'item',
        subjectId: '12',
        correlationId: undefined,
      });
    });
  });
});
