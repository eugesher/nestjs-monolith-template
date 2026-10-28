import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  private static snakeCase(this: void, value: string): string {
    return value
      .replaceAll(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
      .replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase();
  }

  public override tableName(className: string, customName: string | undefined): string {
    return customName ?? SnakeNamingStrategy.snakeCase(className);
  }

  public override columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    const prefix = SnakeNamingStrategy.snakeCase(embeddedPrefixes.concat('').join('_'));
    const name = customName ?? SnakeNamingStrategy.snakeCase(propertyName);

    return prefix + name;
  }

  public override relationName(propertyName: string): string {
    return SnakeNamingStrategy.snakeCase(propertyName);
  }

  public override joinColumnName(relationName: string, referencedColumnName: string): string {
    return SnakeNamingStrategy.snakeCase(`${relationName}_${referencedColumnName}`);
  }

  public override joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    const property = firstPropertyName.replaceAll('.', '_');

    return SnakeNamingStrategy.snakeCase(`${firstTableName}_${property}_${secondTableName}`);
  }

  public override joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return SnakeNamingStrategy.snakeCase(`${tableName}_${columnName ?? propertyName}`);
  }
}
