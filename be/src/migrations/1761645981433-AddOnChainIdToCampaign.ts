import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnChainIdToCampaign1761645981433 implements MigrationInterface {
  name = 'AddOnChainIdToCampaign1761645981433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "onChainId" character varying NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "onChainId"`);
  }
}
