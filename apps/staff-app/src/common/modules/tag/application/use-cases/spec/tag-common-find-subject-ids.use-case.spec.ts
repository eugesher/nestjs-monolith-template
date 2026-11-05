import { TagCommonSubjectTypeEnum } from '@acme-staff/contracts/tag';

import { TagCommonFindSubjectIdsUseCase } from '../tag-common-find-subject-ids.use-case';

describe('TagCommonFindSubjectIdsUseCase', () => {
  let list: jest.Mock;
  let useCase: TagCommonFindSubjectIdsUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue([{ subjectId: '100' }, { subjectId: '101' }]);
    useCase = new TagCommonFindSubjectIdsUseCase({ list });
  });

  describe('execute', () => {
    it('answers the ids of the subjects of a type that carry the tag', async () => {
      const subjectIds = await useCase.execute({
        subjectType: TagCommonSubjectTypeEnum.PRODUCT,
        tagId: '300',
      });

      expect(list).toHaveBeenCalledWith({ subjectType: 'product', tagId: '300' });
      expect(subjectIds).toEqual(['100', '101']);
    });
  });
});
