import { AppE2EContext } from '../../context/app-e2e.context';
import { OrderE2E } from './modules/order.e2e';

export class SalesE2E {
  private constructor(private readonly orderE2E: OrderE2E) {}

  public static of(ctx: AppE2EContext): SalesE2E {
    return new SalesE2E(OrderE2E.of(ctx));
  }

  public execute(): void {
    describe('Order', () => {
      this.orderE2E.handleGetMany();
      this.orderE2E.handleGetOne();
    });
  }
}
