import { TagCommonSubjectTagsModel } from '../tag-common-subject-tags.model';

describe('TagCommonSubjectTagsModel', () => {
  describe('missingTagIds', () => {
    it('answers the requested ids that were not found, once each', () => {
      const missing = TagCommonSubjectTagsModel.missingTagIds(['1', '2', '3', '3'], ['2']);

      expect(missing).toEqual(['1', '3']);
    });

    it('answers nothing when every requested id was found', () => {
      const missing = TagCommonSubjectTagsModel.missingTagIds(['1', '2'], ['2', '1']);

      expect(missing).toEqual([]);
    });
  });

  describe('replace', () => {
    it('links the new tags and unlinks the dropped ones', () => {
      const subjectTags = TagCommonSubjectTagsModel.reconstitute({
        tagIds: ['1', '2'],
      });

      const changes = subjectTags.replace(['2', '3']);

      expect(changes).toEqual({ linkTagIds: ['3'], unlinkTagIds: ['1'] });
    });

    it('changes nothing when the subject already carries exactly the tags', () => {
      const subjectTags = TagCommonSubjectTagsModel.reconstitute({
        tagIds: ['1', '2'],
      });

      const changes = subjectTags.replace(['2', '1', '2']);

      expect(changes).toEqual({ linkTagIds: [], unlinkTagIds: [] });
    });

    it('unlinks every tag when the list is empty', () => {
      const subjectTags = TagCommonSubjectTagsModel.reconstitute({
        tagIds: ['1', '2'],
      });

      const changes = subjectTags.replace([]);

      expect(changes).toEqual({ linkTagIds: [], unlinkTagIds: ['1', '2'] });
    });
  });
});
