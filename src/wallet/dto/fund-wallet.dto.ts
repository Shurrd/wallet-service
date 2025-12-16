import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FundWalletDto {
  @ApiProperty({
    description: 'Amount to add to the wallet',
    example: 100.5,
    minimum: 0.01,
    maximum: 1000000,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @Max(1000000)
  amount: number;

  @ApiPropertyOptional({
    description: 'Unique key to prevent duplicate funding requests',
    example: 'fund_123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional({
    description: 'External payment reference',
    example: 'pay_stripe_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Custom description for the transaction',
    example: 'Monthly salary deposit',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
