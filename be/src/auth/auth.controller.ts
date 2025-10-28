import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import type { AuthorizedRequest } from './types/authorized-request.type';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Set httpOnly cookie with access token
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Login successful',
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: AuthorizedRequest) {
    return {
      user: {
        id: req.user.id,
        walletAddress: req.user.walletAddress,
        createdAt: req.user.createdAt,
      },
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request() req: AuthorizedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    // User is already authenticated via JWT guard
    const result = await this.authService.login({
      walletAddress: req.user.walletAddress,
      signature: '', // Not needed for refresh
      message: '', // Not needed for refresh
    } as LoginDto);

    // Update cookie with new token
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Token refreshed',
      user: result.user,
    };
  }
}
