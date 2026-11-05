import { TagNotFoundException } from '../../../domain';
import { TagAccessService } from '../tag-access.service';

describe('TagAccessService', () => {
  let findById: jest.Mock;
  let service: TagAccessService;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({
      id: '300',
      name: 'fragile',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    service = new TagAccessService({ findById });
  });

  describe('load', () => {
    it('answers the model of the stored tag', async () => {
      const tag = await service.load({ tagId: '300' });

      expect(findById).toHaveBeenCalledWith('300');
      expect(tag.name).toBe('fragile');
    });

    it('throws TagNotFoundException for an unknown tag', async () => {
      findById.mockResolvedValue(null);

      await expect(service.load({ tagId: '999' })).rejects.toThrow(TagNotFoundException);
    });
  });
});
