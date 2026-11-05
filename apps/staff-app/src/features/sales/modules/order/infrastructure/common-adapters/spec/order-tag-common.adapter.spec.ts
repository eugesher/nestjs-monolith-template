import { TagCommonReplaceOutcomeEnum } from '@acme-staff/contracts/tag';

import { OrderTagCommonAdapter } from '../order-tag-common.adapter';

describe('OrderTagCommonAdapter', () => {
  let find: jest.Mock;
  let replace: jest.Mock;
  let findSubjectIds: jest.Mock;
  let adapter: OrderTagCommonAdapter;

  beforeEach(() => {
    find = jest.fn().mockResolvedValue([{ id: '302', name: 'vip' }]);
    replace = jest.fn();
    findSubjectIds = jest.fn().mockResolvedValue(['600']);
    adapter = new OrderTagCommonAdapter({ find, replace, findSubjectIds });
  });

  describe('find', () => {
    it('reads the tags of the order through the common module', async () => {
      const tags = await adapter.find({ orderId: '600' });

      expect(find).toHaveBeenCalledWith({ subjectType: 'order', subjectId: '600' });
      expect(tags).toEqual([{ id: '302', name: 'vip' }]);
    });
  });

  describe('replace', () => {
    it('replaces the tags of the order through the common module', async () => {
      replace.mockResolvedValue({
        outcome: TagCommonReplaceOutcomeEnum.REPLACED,
        tags: [{ id: '302', name: 'vip' }],
        missingTagIds: [],
      });

      const view = await adapter.replace({ orderId: '600', tagIds: ['302'] });

      expect(replace).toHaveBeenCalledWith({
        subjectType: 'order',
        subjectId: '600',
        tagIds: ['302'],
      });
      expect(view).toEqual({
        outcome: 'replaced',
        tags: [{ id: '302', name: 'vip' }],
        missingTagIds: [],
      });
    });

    it('turns the common outcome tag-not-found into its own', async () => {
      replace.mockResolvedValue({
        outcome: TagCommonReplaceOutcomeEnum.TAG_NOT_FOUND,
        tags: [],
        missingTagIds: ['999'],
      });

      const view = await adapter.replace({ orderId: '600', tagIds: ['999'] });

      expect(view).toEqual({ outcome: 'tag-not-found', tags: [], missingTagIds: ['999'] });
    });
  });

  describe('findOrderIds', () => {
    it('reads the ids of the orders that carry the tag', async () => {
      const orderIds = await adapter.findOrderIds({ tagId: '302' });

      expect(findSubjectIds).toHaveBeenCalledWith({ subjectType: 'order', tagId: '302' });
      expect(orderIds).toEqual(['600']);
    });
  });
});
