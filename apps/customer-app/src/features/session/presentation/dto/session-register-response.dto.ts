import { ApiResponseProperty } from '@nestjs/swagger';

export class SessionRegisterResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'eve@example.com' })
  public email: string;
}
