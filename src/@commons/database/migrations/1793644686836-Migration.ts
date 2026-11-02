import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1793644686836 implements MigrationInterface {
  name = 'Migration1793644686836'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "medical_records" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "patient_id" integer NOT NULL, "doctor_id" integer NOT NULL, "text" text NOT NULL, "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c200c0b76638124b7ed51424823" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "medical_records" ADD CONSTRAINT "FK_43e2800e756c913a6c7a07cc271" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "medical_records" ADD CONSTRAINT "FK_57a1aae159d10a5626456ee73d5" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_records" DROP CONSTRAINT "FK_57a1aae159d10a5626456ee73d5"`
    )
    await queryRunner.query(
      `ALTER TABLE "medical_records" DROP CONSTRAINT "FK_43e2800e756c913a6c7a07cc271"`
    )
    await queryRunner.query(`DROP TABLE "medical_records"`)
  }
}
