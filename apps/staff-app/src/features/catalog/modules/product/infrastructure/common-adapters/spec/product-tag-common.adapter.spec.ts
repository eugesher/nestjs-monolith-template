import { TagCommonReplaceOutcomeEnum } from '@acme-staff/contracts/tag';

import { ProductTagCommonAdapter } from '../product-tag-common.adapter';

describe('ProductTagCommonAdapter', () => {
  let handleFind: jest.Mock;
  let handleReplace: jest.Mock;
  let handleFindSubjectIds: jest.Mock;
  let adapter: ProductTagCommonAdapter;

  beforeEach(() => {
    handleFind = jest.fn().mockResolvedValue([{ id: '300', name: 'fragile' }]);
    handleReplace = jest.fn();
    handleFindSubjectIds = jest.fn().mockResolvedValue(['100']);
    adapter = new ProductTagCommonAdapter({ handleFind, handleReplace, handleFindSubjectIds });
  });

  describe('find', () => {
    it('reads the tags of the product through the common module', async () => {
      const tags = await adapter.find({ productId: '100' });

      expect(handleFind).toHaveBeenCalledWith({ subjectType: 'product', subjectId: '100' });
      expect(tags).toEqual([{ id: '300', name: 'fragile' }]);
    });
  });

  describe('replace', () => {
    it('replaces the tags of the product through the common module', async () => {
      handleReplace.mockResolvedValue({
        outcome: TagCommonReplaceOutcomeEnum.REPLACED,
        tags: [{ id: '300', name: 'fragile' }],
        missingTagIds: [],
      });

      const view = await adapter.replace({ productId: '100', tagIds: ['300'] });

      expect(handleReplace).toHaveBeenCalledWith({
        subjectType: 'product',
        subjectId: '100',
        tagIds: ['300'],
      });
      expect(view).toEqual({
        outcome: 'replaced',
        tags: [{ id: '300', name: 'fragile' }],
        missingTagIds: [],
      });
    });

    it('turns the common outcome tag-not-found into its own', async () => {
      handleReplace.mockResolvedValue({
        outcome: TagCommonReplaceOutcomeEnum.TAG_NOT_FOUND,
        tags: [],
        missingTagIds: ['999'],
      });

      const view = await adapter.replace({ productId: '100', tagIds: ['999'] });

      expect(view).toEqual({ outcome: 'tag-not-found', tags: [], missingTagIds: ['999'] });
    });
  });

  describe('findProductIds', () => {
    it('reads the ids of the products that carry the tag', async () => {
      const productIds = await adapter.findProductIds({ tagId: '300' });

      expect(handleFindSubjectIds).toHaveBeenCalledWith({ subjectType: 'product', tagId: '300' });
      expect(productIds).toEqual(['100']);
    });
  });
});
