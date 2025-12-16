import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByUsername(dto.username);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    const accessToken = await this.generateAccessToken(user.id);

    return {
      message: 'User registered successfully',
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user.id);

    return {
      message: 'Login successful',
      username: user.username,
      accessToken,
    };
  }

  async validateJwtUser(userId: string) {
    try {
      return await this.userService.findById(userId);
    } catch (error) {
      return null;
    }
  }

  private async generateAccessToken(userId: string): Promise<string> {
    const payload = { userId };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_EXPIRATION_TIME'),
    });
  }
}
