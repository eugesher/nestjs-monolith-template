import { EntityBase } from '../entity.base';

describe('EntityBase', () => {
  describe('id', () => {
    it('returns the id it was created with', () => {
      class ItemEntity extends EntityBase<number> {
        public constructor(id: number) {
          super(id);
        }
      }

      const item = new ItemEntity(7);

      expect(item.id).toBe(7);
    });
  });

  describe('equals', () => {
    it('is true for the same id within the same concrete subtype', () => {
      class ItemEntity extends EntityBase<number> {
        public constructor(id: number) {
          super(id);
        }
      }

      const equal = new ItemEntity(1).equals(new ItemEntity(1));

      expect(equal).toBe(true);
    });

    it('is false for another id', () => {
      class ItemEntity extends EntityBase<number> {
        public constructor(id: number) {
          super(id);
        }
      }

      const equal = new ItemEntity(1).equals(new ItemEntity(2));

      expect(equal).toBe(false);
    });

    it('is false for the same id of another subtype', () => {
      class ItemEntity extends EntityBase<number> {
        public constructor(id: number) {
          super(id);
        }
      }
      class NoteEntity extends EntityBase<number> {
        public constructor(id: number) {
          super(id);
        }
      }

      const equal = new ItemEntity(1).equals(new NoteEntity(1));

      expect(equal).toBe(false);
    });

    it('is false for a missing entity', () => {
      class ItemEntity extends EntityBase<number> {
        public constructor(id: number) {
          super(id);
        }
      }

      const equal = new ItemEntity(1).equals(undefined);

      expect(equal).toBe(false);
    });
  });
});
