import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1792792326870 implements MigrationInterface {
  name = 'Migration1792792326870'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "patients" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "name" character varying(255) NOT NULL, "cpf" character varying(255) NOT NULL, "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_5947301223f5a908fd5e372b0fb" UNIQUE ("cpf"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT '{patient}'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY['patient'`
    )
    await queryRunner.query(`DROP TABLE "patients"`)
  }
}
