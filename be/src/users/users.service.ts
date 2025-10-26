import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { walletAddress } });
  }

  async createUser(walletAddress: string): Promise<User> {
    const user = this.usersRepository.create({ walletAddress });
    return this.usersRepository.save(user);
  }

  async findOrCreate(walletAddress: string): Promise<User> {
    let user = await this.findByWalletAddress(walletAddress);
    if (!user) {
      user = await this.createUser(walletAddress);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
