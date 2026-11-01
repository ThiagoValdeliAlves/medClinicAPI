import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793566226336 implements MigrationInterface {
  name = 'Migration1793566226336'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'in_progress', 'done', 'cancelled')`
    )
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "patient_id" integer NOT NULL, "doctor_id" integer NOT NULL, "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "duration" integer NOT NULL, "status" "public"."appointments_status_enum" NOT NULL, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "appointments"`)
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`)
  }
}
