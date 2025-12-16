// src/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new BadRequestException('user already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('user already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    // return this.userRepository.findOne({ where: { username } });

    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
