import { ProductStatusEnum } from '@acme-libs/kernel';
import { AggregateRoot, Maybe } from '@acme-libs/toolkit';
import { OrderErrorCodeEnum } from '../enums/order-error-code.enum';
import { OrderDomainException } from '../exceptions/order-domain.exception';
import { IOrderDraft } from '../interfaces/order-draft.interface';
import { IOrderProduct } from '../interfaces/order-product.interface';
import { IOrderRecord } from '../interfaces/order-record.interface';
import { IOrderStock } from '../interfaces/order-stock.interface';

export class OrderModel extends AggregateRoot<Maybe<string>> {
  private constructor(
    id: Maybe<string>,
    public readonly customerId: string,
    public readonly products: readonly IOrderProduct[],
    public readonly createdAt: Maybe<Date>,
  ) {
    super(id);
  }

  public static place(draft: IOrderDraft): OrderModel {
    const { customerId, productIds, stock } = draft;

    if (productIds.length === 0) {
      throw new OrderDomainException(
        OrderErrorCodeEnum.ORDER_EMPTY,
        'An order must contain at least one product',
      );
    }

    const units = productIds.map((productId) => OrderModel.activeStock(productId, stock));

    OrderModel.assertInStock(units);

    const products = units.map((unit) => ({
      id: undefined,
      productId: unit.productId,
      sku: unit.sku,
      name: unit.name,
    }));

    return new OrderModel(undefined, customerId, products, undefined);
  }

  public static reconstitute(record: IOrderRecord): OrderModel {
    const { id, customerId, createdAt, products } = record;

    return new OrderModel(id, customerId, products, createdAt);
  }

  private static activeStock(productId: string, stock: IOrderStock[]): IOrderStock {
    const unit = stock.find((candidate) => candidate.productId === productId);

    if (unit?.status !== ProductStatusEnum.ACTIVE) {
      throw new OrderDomainException(
        OrderErrorCodeEnum.ORDER_PRODUCT_NOT_FOUND,
        `Product ${productId} was not found`,
        { productId },
      );
    }

    return unit;
  }

  private static assertInStock(units: IOrderStock[]): void {
    for (const unit of units) {
      const { productId, quantity } = unit;
      const requested = units.filter((other) => other.productId === productId).length;

      if (requested > quantity) {
        throw new OrderDomainException(
          OrderErrorCodeEnum.ORDER_STOCK_INSUFFICIENT,
          `Product ${productId} has ${quantity} in stock, ${requested} requested`,
          { productId, requested, available: quantity },
        );
      }
    }
  }
}
