import { AppE2EContext } from '../context/app-e2e.context';
import { CatalogE2E, WarehouseE2E } from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const catalogE2E = CatalogE2E.of(ctx);
  const warehouseE2E = WarehouseE2E.of(ctx);

  beforeAll(async () => {
    await ctx.init();
  });

  afterEach(() => {
    expect(ctx.takeRootWarnings()).toEqual([]);
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('Catalog', () => {
    catalogE2E.execute();
  });

  describe('Warehouse', () => {
    warehouseE2E.execute();
  });
});
