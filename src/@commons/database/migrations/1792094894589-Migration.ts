import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1792094894589 implements MigrationInterface {
  name = 'Migration1792094894589'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "name" character varying(255)`
    )

    await queryRunner.query(
      `UPDATE "users"
       SET "name" = $1
       WHERE "email" = $2`,
      ['Administrador', 'admin@admin.com']
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`)
  }
}
