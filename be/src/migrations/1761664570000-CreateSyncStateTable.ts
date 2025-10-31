import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSyncStateTable1761664570000 implements MigrationInterface {
    name = 'CreateSyncStateTable1761664570000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sync_state" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "lastSyncedBlock" bigint NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c1d9733c37275e3d785eb375ec2" UNIQUE ("key"), CONSTRAINT "PK_4c68d03775b8818b4e50b6dba84" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sync_state"`);
    }

}
