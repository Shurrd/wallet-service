import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { TransferDto } from './dto/transfer.dto';
import { Wallet } from 'src/entities/wallet.entity';
import { Transaction, TransactionType } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createWallet(userId: string, createWalletDto: CreateWalletDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingWallet = await this.walletRepository.findOne({
      where: {
        user: { id: userId },
        currency: createWalletDto.currency,
      },
      relations: ['user'],
    });

    if (existingWallet) {
      throw new BadRequestException(
        `User already has a ${createWalletDto.currency} wallet`,
      );
    }

    const wallet = this.walletRepository.create({
      ...createWalletDto,
      user,
      balance: 0,
    });

    await this.walletRepository.save(wallet);

    return {
      message: `${createWalletDto.currency} Wallet created successfully`,
      walletId: wallet.id,
      username: user.username,
    };
  }

  // Fund Wallet
  async fundWallet(
    walletId: string,
    fundWalletDto: FundWalletDto,
  ): Promise<Wallet> {
    // Check idempotency
    if (fundWalletDto.idempotencyKey) {
      const existingTransaction = await this.transactionRepository.findOne({
        where: { idempotencyKey: fundWalletDto.idempotencyKey },
      });

      if (existingTransaction) {
        const wallet = await this.walletRepository.findOne({
          where: { id: walletId },
        });

        if (!wallet) {
          throw new NotFoundException(
            'Wallet not found for idempotent request',
          );
        }

        return wallet;
      }
    }

    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (fundWalletDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const newBalance = Number(wallet.balance) + Number(fundWalletDto.amount);
    wallet.balance = newBalance;

    // Generate unique reference if not provided
    const reference = this.generateTransactionReference('FUND');

    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      amount: fundWalletDto.amount,
      balanceAfter: newBalance,
      type: TransactionType.FUND,
      reference: reference,
      idempotencyKey: fundWalletDto.idempotencyKey,
      description: `Funded wallet with ${fundWalletDto.amount} ${wallet.currency}`,
    });

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(wallet);
      await transactionalEntityManager.save(transaction);
    });

    return wallet;
  }

  async transfer(transferDto: TransferDto): Promise<{
    senderWallet: Wallet;
    receiverWallet: Wallet;
  }> {
    const { fromWalletId, toWalletId, amount, idempotencyKey } = transferDto;

    // Check for duplicate request
    if (idempotencyKey) {
      const existingTransaction = await this.transactionRepository.findOne({
        where: { idempotencyKey },
      });

      if (existingTransaction) {
        const sender = await this.walletRepository.findOne({
          where: { id: fromWalletId },
        });

        const receiver = await this.walletRepository.findOne({
          where: { id: toWalletId },
        });

        if (!sender || !receiver) {
          throw new NotFoundException(
            `Wallet(s) not found for idempotent transfer. Sender: ${!!sender}, Receiver: ${!!receiver}`,
          );
        }

        return { senderWallet: sender, receiverWallet: receiver };
      }
    }

    if (fromWalletId === toWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const [senderWallet, receiverWallet] = await Promise.all([
          transactionalEntityManager
            .createQueryBuilder(Wallet, 'wallet')
            .setLock('pessimistic_write')
            .where('wallet.id = :id', { id: fromWalletId })
            .getOne(),
          transactionalEntityManager
            .createQueryBuilder(Wallet, 'wallet')
            .setLock('pessimistic_write')
            .where('wallet.id = :id', { id: toWalletId })
            .getOne(),
        ]);

        if (!senderWallet) {
          throw new NotFoundException('Sender wallet not found');
        }

        if (!receiverWallet) {
          throw new NotFoundException('Receiver wallet not found');
        }

        if (senderWallet.currency !== receiverWallet.currency) {
          throw new BadRequestException(
            `Cannot transfer between different currencies (${senderWallet.currency} to ${receiverWallet.currency})`,
          );
        }

        if (Number(senderWallet.balance) < Number(amount)) {
          throw new BadRequestException('Insufficient balance');
        }

        // Update balances
        const senderNewBalance = Number(senderWallet.balance) - Number(amount);
        const receiverNewBalance =
          Number(receiverWallet.balance) + Number(amount);

        senderWallet.balance = senderNewBalance;
        receiverWallet.balance = receiverNewBalance;

        const reference = this.generateTransactionReference('TRF');

        // Create transaction records
        const senderTransaction = this.transactionRepository.create({
          walletId: senderWallet.id,
          amount: -amount,
          balanceAfter: senderNewBalance,
          type: TransactionType.TRANSFER_OUT,
          reference: reference,
          relatedWalletId: receiverWallet.id,
          idempotencyKey,
          description: `Transferred ${amount} ${senderWallet.currency} to wallet ${receiverWallet.id}`,
        });

        const receiverTransaction = this.transactionRepository.create({
          walletId: receiverWallet.id,
          amount: amount,
          balanceAfter: receiverNewBalance,
          type: TransactionType.TRANSFER_IN,
          reference: reference,
          relatedWalletId: senderWallet.id,
          idempotencyKey,
          description: `Received ${amount} ${receiverWallet.currency} from wallet ${senderWallet.id}`,
        });

        await transactionalEntityManager.save([senderWallet, receiverWallet]);
        await transactionalEntityManager.save([
          senderTransaction,
          receiverTransaction,
        ]);

        return { senderWallet, receiverWallet };
      },
    );
  }

  async getWallet(walletId: string): Promise<{
    wallet: Wallet;
    transactions: Transaction[];
  }> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transactions = await this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return { wallet, transactions };
  }

  // Get User's Wallets
  async getUserWallets(userId: string): Promise<Wallet[]> {
    console.log('=== GET USER WALLETS ===');
    console.log('Requested userId:', userId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('Found user:', user.username);

    const wallets = await this.walletRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    console.log('Found wallets:', wallets.length);
    wallets.forEach((wallet, index) => {
      console.log(`Wallet ${index + 1}:`, {
        id: wallet.id,
        userId: wallet.user?.id,
        username: wallet.user?.username,
        currency: wallet.currency,
      });
    });

    return wallets;
  }

  // Get Wallet Balance
  async getWalletBalance(walletId: string): Promise<number> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
      select: ['balance'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return Number(wallet.balance);
  }

  private generateTransactionReference(prefix: string = 'TX'): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}_${timestamp}_${randomStr}`;
  }
}
