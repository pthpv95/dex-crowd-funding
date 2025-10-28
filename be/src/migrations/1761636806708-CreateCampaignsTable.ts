import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCampaignsTable1761636806708 implements MigrationInterface {
    name = 'CreateCampaignsTable1761636806708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creatorId" uuid NOT NULL, "description" text NOT NULL, "goal" numeric(20,0) NOT NULL, "deadline" TIMESTAMP NOT NULL, "isWithdrawn" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "isGoalReached" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_19e6402a02a408ea0ce5c2d5e3f" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_19e6402a02a408ea0ce5c2d5e3f"`);
        await queryRunner.query(`DROP TABLE "campaigns"`);
    }

}
