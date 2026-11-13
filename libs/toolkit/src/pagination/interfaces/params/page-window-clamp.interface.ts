interface IPageWindowClampQuery {
  page?: number;
  limit?: number;
}

interface IPageWindowClampOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
  maxPage?: number;
}

export interface IPageWindowClamp {
  query: IPageWindowClampQuery;
  options?: IPageWindowClampOptions;
}
