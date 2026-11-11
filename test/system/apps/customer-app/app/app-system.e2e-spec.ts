import { AppE2EContext } from '../context/app-e2e.context';
import { AuthE2E, OrderE2E } from '../features';

describe('App', () => {
  jest.setTimeout(90000);

  const ctx = new AppE2EContext();

  const authE2E = AuthE2E.of(ctx);
  const orderE2E = OrderE2E.of(ctx);

  beforeAll(async () => {
    await ctx.init();
  });

  afterEach(() => {
    expect(ctx.takeRootWarnings()).toEqual([]);
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('Auth', () => {
    authE2E.handleRegister();
  });

  describe('Order', () => {
    orderE2E.handlePlace();
  });
});
