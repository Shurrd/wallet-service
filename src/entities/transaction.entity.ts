import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  FUND = 'FUND',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'balance_after' })
  balanceAfter: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true, name: 'related_wallet_id' })
  relatedWalletId: string;

  @Column({ nullable: true, name: 'idempotency_key' })
  idempotencyKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  wallet: Wallet;

  @Column({ name: 'wallet_id' })
  walletId: string;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
