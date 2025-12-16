import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  fromWalletId: string;

  @IsString()
  @IsNotEmpty()
  toWalletId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}
