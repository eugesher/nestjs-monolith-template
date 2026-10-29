import { ProductStatusEnum } from '@acme-libs/kernel';
import { AggregateRoot, Maybe } from '@acme-libs/toolkit';
import { ProductErrorCodeEnum } from '../enums/product-error-code.enum';
import { ProductArchivedEvent } from '../events/product-archived.event';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductRenamedEvent } from '../events/product-renamed.event';
import { ProductDomainException } from '../exceptions/product-domain.exception';
import { IProductDraft } from '../interfaces/product-draft.interface';
import { IProductRecord } from '../interfaces/product-record.interface';

export class ProductModel extends AggregateRoot<Maybe<string>> {
  private static readonly SKU_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,63}$/;
  private static readonly NAME_MAX_LENGTH = 255;

  private constructor(
    id: Maybe<string>,
    public readonly sku: string,
    private currentName: string,
    private currentStatus: ProductStatusEnum,
    private currentVersion: number,
    public readonly createdAt: Maybe<Date>,
    public readonly updatedAt: Maybe<Date>,
  ) {
    super(id);
  }

  public static create(draft: IProductDraft): ProductModel {
    const { sku, name } = draft;
    const validSku = ProductModel.validSku(sku);
    const validName = ProductModel.validName(name);
    const product = new ProductModel(
      undefined,
      validSku,
      validName,
      ProductStatusEnum.DRAFT,
      1,
      undefined,
      undefined,
    );
    const event = new ProductCreatedEvent(undefined, product.sku, product.name);

    product.addDomainEvent(event);

    return product;
  }

  public static reconstitute(record: IProductRecord): ProductModel {
    const { id, sku, name, status, version, createdAt, updatedAt } = record;
    const validSku = ProductModel.validSku(sku);
    const validName = ProductModel.validName(name);
    const validVersion = ProductModel.validVersion(version);

    return new ProductModel(id, validSku, validName, status, validVersion, createdAt, updatedAt);
  }

  private static validSku(sku: string): string {
    if (!ProductModel.SKU_PATTERN.test(sku)) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_SKU_INVALID,
        `Product.sku must match ${String(ProductModel.SKU_PATTERN)}, got ${sku}`,
      );
    }

    return sku;
  }

  private static validName(name: string): string {
    const trimmed = name.trim();

    if (trimmed.length === 0 || trimmed.length > ProductModel.NAME_MAX_LENGTH) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_NAME_INVALID,
        `Product.name must be a non-empty string of at most ${ProductModel.NAME_MAX_LENGTH} characters`,
      );
    }

    return trimmed;
  }

  private static validVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_VERSION_INVALID,
        `Product.version must be a positive integer, got ${version}`,
      );
    }

    return version;
  }

  public get name(): string {
    return this.currentName;
  }

  public get status(): ProductStatusEnum {
    return this.currentStatus;
  }

  public get version(): number {
    return this.currentVersion;
  }

  public rename(name: string): void {
    this.assertNotArchived();

    const validName = ProductModel.validName(name);

    if (validName === this.currentName) {
      return;
    }

    const previousName = this.currentName;

    this.currentName = validName;
    this.currentVersion += 1;

    const event = new ProductRenamedEvent(this.id, validName, previousName);

    this.addDomainEvent(event);
  }

  public activate(): void {
    this.assertNotArchived();

    if (this.currentStatus === ProductStatusEnum.ACTIVE) {
      return;
    }

    this.currentStatus = ProductStatusEnum.ACTIVE;
    this.currentVersion += 1;
  }

  public archive(): void {
    this.assertNotArchived();

    const previousStatus = this.currentStatus;

    this.currentStatus = ProductStatusEnum.ARCHIVED;
    this.currentVersion += 1;

    const event = new ProductArchivedEvent(this.id, this.sku, previousStatus);

    this.addDomainEvent(event);
  }

  private assertNotArchived(): void {
    if (this.currentStatus === ProductStatusEnum.ARCHIVED) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_ALREADY_ARCHIVED,
        `Product ${String(this.id)} is archived and can no longer be modified`,
      );
    }
  }
}
