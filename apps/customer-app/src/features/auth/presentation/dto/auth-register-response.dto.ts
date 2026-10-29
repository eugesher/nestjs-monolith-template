import { ApiResponseProperty } from '@nestjs/swagger';

export class AuthRegisterResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'eve@example.com' })
  public email: string;
}
