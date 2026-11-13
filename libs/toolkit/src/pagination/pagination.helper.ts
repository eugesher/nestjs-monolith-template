import type { IPage, IPageBuild, IPageWindow, IPageWindowClamp } from './interfaces';

export class PaginationHelper {
  public static readonly MAX_PAGE = 1000;
  public static readonly MAX_LIMIT = 100;

  public static clampPageWindow(params: IPageWindowClamp): IPageWindow {
    const { query, options = {} } = params;
    const { page: queryPage, limit: queryLimit } = query;
    const {
      defaultPage = 1,
      defaultLimit = 20,
      maxLimit = PaginationHelper.MAX_LIMIT,
      maxPage = PaginationHelper.MAX_PAGE,
    } = options;
    const flooredPage = Math.floor(queryPage ?? 0);
    const flooredLimit = Math.floor(queryLimit ?? 0);
    const page = flooredPage > 0 ? Math.min(flooredPage, maxPage) : defaultPage;
    const limit = flooredLimit > 0 ? Math.min(flooredLimit, maxLimit) : defaultLimit;
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  public static toPage<T>(params: IPageBuild<T>): IPage<T> {
    const { data, page, limit, total } = params;
    const count = data.length;
    const pageCount = Math.ceil(total / limit);

    return { page, count, pageCount, total, data };
  }
}
