import { PaginationHelper } from '../pagination.helper';

describe('PaginationHelper', () => {
  describe('clampPageWindow', () => {
    it('defaults an absent window', () => {
      const window = PaginationHelper.clampPageWindow(undefined, undefined);

      expect(window).toEqual({ page: 1, size: 20 });
    });

    it('keeps a valid window', () => {
      const window = PaginationHelper.clampPageWindow(3, 50);

      expect(window).toEqual({ page: 3, size: 50 });
    });

    it('collapses a fractional page in (0, 1) to the default instead of a negative offset', () => {
      const window = PaginationHelper.clampPageWindow(0.5, 10);

      expect(window).toEqual({ page: 1, size: 10 });
    });

    it.each([
      [0, 0],
      [-3, -3],
    ])('replaces page %d and size %d with the defaults', (page, size) => {
      const window = PaginationHelper.clampPageWindow(page, size);

      expect(window).toEqual({ page: 1, size: 20 });
    });

    it('caps an oversized page size', () => {
      const window = PaginationHelper.clampPageWindow(1, 10_000);

      expect(window).toEqual({ page: 1, size: 100 });
    });

    it('takes the defaults and the cap from the options', () => {
      const absent = PaginationHelper.clampPageWindow(undefined, undefined, {
        defaultPage: 2,
        defaultSize: 5,
      });
      const oversized = PaginationHelper.clampPageWindow(1, 10_000, { maxSize: 50 });

      expect(absent).toEqual({ page: 2, size: 5 });
      expect(oversized).toEqual({ page: 1, size: 50 });
    });
  });
});
