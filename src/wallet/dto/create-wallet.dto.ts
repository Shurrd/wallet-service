import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CURRENCIES = ['USD'];

export class CreateWalletDto {
  @ApiProperty({
    description: 'Currency code for the wallet',
    example: 'USD',
    enum: CURRENCIES,
    default: 'USD',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(CURRENCIES)
  currency: string;
}
