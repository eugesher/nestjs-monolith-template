import { ApiResponseProperty } from '@nestjs/swagger';

export class UserRolesResponseDto {
  @ApiResponseProperty()
  public id: string;

  @ApiResponseProperty({ example: ['editor'] })
  public roles: string[];
}
