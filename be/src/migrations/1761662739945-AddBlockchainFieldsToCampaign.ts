import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlockchainFieldsToCampaign1761662739945
  implements MigrationInterface
{
  name = 'AddBlockchainFieldsToCampaign1761662739945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "creatorAddress" character varying(42)`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "amountRaised" numeric(20,0) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" DROP CONSTRAINT "FK_19e6402a02a408ea0ce5c2d5e3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ALTER COLUMN "creatorId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD CONSTRAINT "UQ_c2712026334e6da641a5160c560" UNIQUE ("onChainId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD CONSTRAINT "FK_19e6402a02a408ea0ce5c2d5e3f" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" DROP CONSTRAINT "FK_19e6402a02a408ea0ce5c2d5e3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" DROP CONSTRAINT "UQ_c2712026334e6da641a5160c560"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ALTER COLUMN "creatorId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD CONSTRAINT "FK_19e6402a02a408ea0ce5c2d5e3f" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" DROP COLUMN "amountRaised"`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" DROP COLUMN "creatorAddress"`,
    );
  }
}
