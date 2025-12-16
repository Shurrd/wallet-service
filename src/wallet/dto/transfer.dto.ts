import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({
    description: 'UUID of the sender wallet',
    example: '624aa7e9-656d-4b3d-aee6-d184559e228c',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  fromWalletId: string;

  @ApiProperty({
    description: 'UUID of the receiver wallet',
    example: '3ac8f653-f4f7-4ec0-84eb-14d56315ef81',
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  toWalletId: string;

  @ApiProperty({
    description: 'Amount to transfer',
    example: 50.75,
    minimum: 0.01,
    maximum: 100000,
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @Max(100000)
  amount: number;

  @ApiPropertyOptional({
    description: 'Unique key to prevent duplicate transfer requests',
    example: 'transfer_123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
