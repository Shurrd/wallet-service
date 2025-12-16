import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Create a new wallet
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Request() req, @Body() createWalletDto: CreateWalletDto) {
    return await this.walletService.createWallet(req.user.id, createWalletDto);
  }

  // Get all wallets for the authenticated user
  @Get()
  async getUserWallets(@Request() req) {
    return await this.walletService.getUserWallets(req.user.id);
  }

  // Get specific wallet details
  @Get(':id')
  async getWallet(@Param('id', ParseUUIDPipe) id: string) {
    return await this.walletService.getWallet(id);
  }

  // Fund a wallet
  @Post(':id/fund')
  async fundWallet(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() fundWalletDto: FundWalletDto,
  ) {
    return await this.walletService.fundWallet(id, fundWalletDto);
  }

  // Transfer between wallets
  @Post('transfer')
  async transfer(@Body() transferDto: TransferDto) {
    return await this.walletService.transfer(transferDto);
  }

  @Get(':id/balance')
  async getWalletBalance(@Param('id', ParseUUIDPipe) id: string) {
    return await this.walletService.getWalletBalance(id);
  }
}
