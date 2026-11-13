import { PaginationHelper } from '../pagination.helper';

describe('PaginationHelper', () => {
  describe('clampPageWindow', () => {
    it('defaults an absent window', () => {
      const pageWindow = PaginationHelper.clampPageWindow({ query: {} });

      expect(pageWindow).toEqual({ page: 1, limit: 20, offset: 0 });
    });

    it('keeps a valid window', () => {
      const pageWindow = PaginationHelper.clampPageWindow({ query: { page: 3, limit: 50 } });

      expect(pageWindow).toEqual({ page: 3, limit: 50, offset: 100 });
    });

    it('collapses a fractional page in (0, 1) to the default instead of a negative offset', () => {
      const pageWindow = PaginationHelper.clampPageWindow({ query: { page: 0.5, limit: 10 } });

      expect(pageWindow).toEqual({ page: 1, limit: 10, offset: 0 });
    });

    it.each([
      [0, 0],
      [-3, -3],
    ])('replaces page %d and limit %d with the defaults', (page, limit) => {
      const pageWindow = PaginationHelper.clampPageWindow({ query: { page, limit } });

      expect(pageWindow).toEqual({ page: 1, limit: 20, offset: 0 });
    });

    it('caps an oversized page limit', () => {
      const pageWindow = PaginationHelper.clampPageWindow({ query: { page: 1, limit: 10_000 } });

      expect(pageWindow).toEqual({ page: 1, limit: 100, offset: 0 });
    });

    it('caps an oversized page number so the offset stays a plain integer', () => {
      const pageWindow = PaginationHelper.clampPageWindow({ query: { page: 1e20, limit: 100 } });

      expect(pageWindow).toEqual({ page: 1000, limit: 100, offset: 99_900 });
    });

    it('takes the defaults and the cap from the options', () => {
      const absent = PaginationHelper.clampPageWindow({
        query: {},
        options: { defaultPage: 2, defaultLimit: 5 },
      });
      const oversized = PaginationHelper.clampPageWindow({
        query: { page: 10, limit: 10_000 },
        options: { maxLimit: 50, maxPage: 3 },
      });

      expect(absent).toEqual({ page: 2, limit: 5, offset: 5 });
      expect(oversized).toEqual({ page: 3, limit: 50, offset: 100 });
    });
  });

  describe('toPage', () => {
    it('answers the page with the rows on it, the number of pages and the total', () => {
      const page = PaginationHelper.toPage({ data: ['a', 'b'], page: 3, limit: 20, total: 42 });

      expect(page).toEqual({ page: 3, count: 2, pageCount: 3, total: 42, data: ['a', 'b'] });
    });

    it('counts no pages for no rows', () => {
      const page = PaginationHelper.toPage({ data: [], page: 1, limit: 20, total: 0 });

      expect(page).toEqual({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });
    });
  });
});
