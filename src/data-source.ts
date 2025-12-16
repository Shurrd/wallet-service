import { DataSource, DataSourceOptions, Transaction } from 'typeorm';
import { config } from 'dotenv';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Wallet, Transaction],
  migrations: ['dist/migrations/*.js'],
  synchronize: true,
};

export const AppDataSource = new DataSource(dataSourceOptions);
