import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FundWalletDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
