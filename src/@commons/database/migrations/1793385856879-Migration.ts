import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793385856879 implements MigrationInterface {
  name = 'Migration1793385856879'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "work_schedules" ("id" SERIAL NOT NULL, "doctor_id" integer NOT NULL, "shifts" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "UQ_aadc39d930997125d4946927d80" UNIQUE ("doctor_id"), CONSTRAINT "REL_aadc39d930997125d4946927d8" UNIQUE ("doctor_id"), CONSTRAINT "PK_f5251879700e5ca0d2e353fa34f" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "work_schedules" ADD CONSTRAINT "FK_aadc39d930997125d4946927d80" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_schedules" DROP CONSTRAINT "FK_aadc39d930997125d4946927d80"`
    )
    await queryRunner.query(`DROP TABLE "work_schedules"`)
  }
}
