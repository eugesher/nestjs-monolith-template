import { IPageRequest } from './page-request.interface';
import { IPageWindowOptions } from './page-window-options.interface';

export class PaginationHelper {
  public static clampPageWindow(
    page: number | undefined,
    size: number | undefined,
    options: IPageWindowOptions = {},
  ): IPageRequest {
    const { defaultPage = 1, defaultSize = 20, maxSize = 100 } = options;
    const flooredPage = Math.floor(page ?? 0);
    const flooredSize = Math.floor(size ?? 0);
    const clampedPage = flooredPage > 0 ? flooredPage : defaultPage;
    const clampedSize = flooredSize > 0 ? Math.min(flooredSize, maxSize) : defaultSize;

    return { page: clampedPage, size: clampedSize };
  }
}
