import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sync_state')
export class SyncState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  key: string; // e.g., 'campaign_sync'

  @Column({ type: 'bigint' })
  lastSyncedBlock: string; // Store as string to handle large block numbers

  @UpdateDateColumn()
  updatedAt: Date;
}
