import { TagNameInvalidException } from '../../exceptions/tag-name-invalid.exception';
import { TagModel } from '../tag.model';

describe('TagModel', () => {
  describe('createDraft', () => {
    it('drafts a tag with the trimmed name', () => {
      const draft = TagModel.createDraft({ name: '  fragile  ' });

      expect(draft).toEqual({ name: 'fragile' });
    });

    it.each([
      ['an empty name', ''],
      ['a name of spaces', '   '],
      ['a name of 65 characters', 'a'.repeat(65)],
    ])('rejects %s', (_case, name) => {
      expect(() => TagModel.createDraft({ name })).toThrow(TagNameInvalidException);
    });

    it('accepts a name of 64 characters', () => {
      const draft = TagModel.createDraft({ name: 'a'.repeat(64) });

      expect(draft).toEqual({ name: 'a'.repeat(64) });
    });
  });

  describe('reconstitute', () => {
    it('answers the view of the stored tag', () => {
      const tag = TagModel.reconstitute({
        id: '300',
        name: 'fragile',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(tag.toView()).toEqual({
        id: '300',
        name: 'fragile',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });
  });

  describe('rename', () => {
    it('takes the trimmed new name', () => {
      const tag = TagModel.reconstitute({
        id: '300',
        name: 'fragile',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      tag.rename(' handle-with-care ');

      expect(tag.name).toBe('handle-with-care');
    });

    it('keeps the old name when the new one is invalid', () => {
      const tag = TagModel.reconstitute({
        id: '300',
        name: 'fragile',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(() => tag.rename(' ')).toThrow(TagNameInvalidException);
      expect(tag.name).toBe('fragile');
    });
  });
});
