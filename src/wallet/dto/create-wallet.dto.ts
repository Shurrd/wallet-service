import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateWalletDto {
  @IsEnum(['USD', 'EUR', 'GBP'], {
    message: 'Currency must be USD, EUR, or GBP',
  })
  @IsNotEmpty()
  currency: string;
}
