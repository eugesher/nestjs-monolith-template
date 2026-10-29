import { ApiResponseProperty } from '@nestjs/swagger';

export class SessionTokenPairResponseDto {
  @ApiResponseProperty()
  public accessToken: string;

  @ApiResponseProperty()
  public refreshToken: string;
}
