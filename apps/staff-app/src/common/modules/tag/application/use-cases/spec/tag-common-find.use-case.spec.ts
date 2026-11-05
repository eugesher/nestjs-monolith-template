import { TagCommonSubjectTypeEnum } from '@acme-staff/contracts/tag';

import { TagCommonFindUseCase } from '../tag-common-find.use-case';

describe('TagCommonFindUseCase', () => {
  let list: jest.Mock;
  let useCase: TagCommonFindUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue([
      { id: '300', name: 'fragile' },
      { id: '301', name: 'promo' },
    ]);
    useCase = new TagCommonFindUseCase({ list });
  });

  describe('execute', () => {
    it('answers the tags of the subject', async () => {
      const tags = await useCase.execute({
        subjectType: TagCommonSubjectTypeEnum.PRODUCT,
        subjectId: '100',
      });

      expect(list).toHaveBeenCalledWith({ subjectType: 'product', subjectId: '100' });
      expect(tags).toEqual([
        { id: '300', name: 'fragile' },
        { id: '301', name: 'promo' },
      ]);
    });
  });
});
