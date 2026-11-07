import { IPageRequest } from './page-request.interface';
import { IPageWindowOptions } from './page-window-options.interface';
import { IPage } from './page.interface';

export class PaginationHelper {
  public static clampPageWindow(
    page: number | undefined,
    limit: number | undefined,
    options: IPageWindowOptions = {},
  ): IPageRequest {
    const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = options;
    const flooredPage = Math.floor(page ?? 0);
    const flooredLimit = Math.floor(limit ?? 0);
    const clampedPage = flooredPage > 0 ? flooredPage : defaultPage;
    const clampedLimit = flooredLimit > 0 ? Math.min(flooredLimit, maxLimit) : defaultLimit;
    const offset = (clampedPage - 1) * clampedLimit;

    return { page: clampedPage, limit: clampedLimit, offset };
  }

  public static toPage<T>(
    data: T[],
    total: number,
    request: Pick<IPageRequest, 'page' | 'limit'>,
  ): IPage<T> {
    const { page, limit } = request;
    const pageCount = Math.ceil(total / limit);

    return { page, count: data.length, pageCount, total, data };
  }
}
