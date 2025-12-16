import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'securePassword123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
