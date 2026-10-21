import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1792095000000 implements MigrationInterface {
  name = 'Migration1792095000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      RENAME COLUMN "role" TO "roles"
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "roles" DROP DEFAULT
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "roles" TYPE "public"."user_roles"[]
      USING ARRAY["roles"]::"public"."user_roles"[]
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "roles"
      SET DEFAULT ARRAY['patient']::"public"."user_roles"[]
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "roles" DROP DEFAULT
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "roles" TYPE "public"."user_roles"
      USING ("roles"[1])::"public"."user_roles"
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "roles" SET DEFAULT 'patient'
    `)

    await queryRunner.query(`
      ALTER TABLE "users"
      RENAME COLUMN "roles" TO "role"
    `)
  }
}
