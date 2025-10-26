import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { verifyMessage } from 'ethers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { walletAddress, signature, message } = loginDto;

    // Allow skipping verification for refresh token requests
    if (signature && message) {
      try {
        // Verify the signature
        const recoveredAddress = verifyMessage(message, signature);

        // Check if the recovered address matches the provided wallet address (case-insensitive)
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          throw new UnauthorizedException('Invalid signature');
        }

        // Validate message format (should match frontend format)
        if (!this.validateMessageFormat(message, walletAddress)) {
          throw new BadRequestException('Invalid message format');
        }
      } catch (error) {
        if (
          error instanceof UnauthorizedException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }
        throw new UnauthorizedException('Signature verification failed');
      }
    }

    // Find or create user
    const user = await this.usersService.findOrCreate(walletAddress);

    // Generate JWT token
    const payload = { sub: user.id, walletAddress: user.walletAddress };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
      },
    };
  }

  private validateMessageFormat(message: string, walletAddress: string): boolean {
    // Expected format from frontend:
    // Welcome to CrowdFund!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: {address}\nTimestamp: {timestamp}
    const expectedPrefix = 'Welcome to CrowdFund!';
    const walletPattern = `Wallet: ${walletAddress}`;

    return message.includes(expectedPrefix) && message.includes(walletPattern);
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
