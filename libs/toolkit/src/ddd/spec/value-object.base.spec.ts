import { ValueObject } from '../value-object.base';

describe('ValueObject', () => {
  describe('equals', () => {
    it('is true for equal props of the same concrete subtype', () => {
      class MoneyValue extends ValueObject<{ amount: number; currency: string }> {
        constructor(amount: number, currency: string) {
          super({ amount, currency });
        }
      }

      const equal = new MoneyValue(10, 'EUR').equals(new MoneyValue(10, 'EUR'));

      expect(equal).toBe(true);
    });

    it('is false for other props', () => {
      class MoneyValue extends ValueObject<{ amount: number; currency: string }> {
        constructor(amount: number, currency: string) {
          super({ amount, currency });
        }
      }

      const equal = new MoneyValue(10, 'EUR').equals(new MoneyValue(10, 'USD'));

      expect(equal).toBe(false);
    });

    it('is false for equal props of another subtype', () => {
      class MoneyValue extends ValueObject<{ amount: number }> {
        constructor(amount: number) {
          super({ amount });
        }
      }
      class WeightValue extends ValueObject<{ amount: number }> {
        constructor(amount: number) {
          super({ amount });
        }
      }

      const equal = new MoneyValue(10).equals(new WeightValue(10));

      expect(equal).toBe(false);
    });

    it('is false for a missing value', () => {
      class MoneyValue extends ValueObject<{ amount: number }> {
        constructor(amount: number) {
          super({ amount });
        }
      }

      const equal = new MoneyValue(10).equals(undefined);

      expect(equal).toBe(false);
    });
  });

  it('freezes its props', () => {
    class MoneyValue extends ValueObject<{ amount: number }> {
      constructor(amount: number) {
        super({ amount });
      }

      public get frozen(): boolean {
        return Object.isFrozen(this.props);
      }
    }

    const money = new MoneyValue(10);

    expect(money.frozen).toBe(true);
  });
});
