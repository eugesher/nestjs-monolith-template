import { ApiResponseProperty } from '@nestjs/swagger';

export class SessionMeResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: 'ann@example.com' })
  public email: string;
}
