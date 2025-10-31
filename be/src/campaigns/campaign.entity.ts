import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'varchar', length: 42, nullable: true })
  creatorAddress: string; // Blockchain wallet address

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 20, scale: 0 })
  goal: string; // Store as string to handle large numbers (wei)

  @Column({ type: 'timestamp' })
  deadline: Date;

  @Column({ type: 'boolean', default: false })
  isWithdrawn: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isGoalReached: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true, unique: true })
  onChainId: string; // Campaign ID from blockchain

  @Column({ type: 'decimal', precision: 20, scale: 0, default: '0' })
  amountRaised: string; // Total amount raised in wei
}
