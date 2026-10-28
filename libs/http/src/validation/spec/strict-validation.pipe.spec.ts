import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

import { StrictValidationPipe } from '../strict-validation.pipe';

describe('StrictValidationPipe', () => {
  it('transforms the body into the DTO with typed fields', async () => {
    class CreateItemDto {
      @IsString()
      public title: string;

      @Type(() => Number)
      @IsInt()
      public quantity: number;
    }

    const metadata: ArgumentMetadata = { type: 'body', metatype: CreateItemDto };

    const value: unknown = await new StrictValidationPipe().transform(
      { title: 'Lamp', quantity: '3' },
      metadata,
    );

    expect(value).toBeInstanceOf(CreateItemDto);
    expect(value).toEqual({ title: 'Lamp', quantity: 3 });
  });

  it('rejects a field the DTO does not declare', async () => {
    class CreateItemDto {
      @IsString()
      public title: string;
    }

    const metadata: ArgumentMetadata = { type: 'body', metatype: CreateItemDto };

    const transformed = new StrictValidationPipe().transform(
      { title: 'Lamp', ownerId: 'other' },
      metadata,
    );

    await expect(transformed).rejects.toBeInstanceOf(BadRequestException);
    await expect(transformed).rejects.toMatchObject({
      response: { message: ['property ownerId should not exist'] },
    });
  });
});
