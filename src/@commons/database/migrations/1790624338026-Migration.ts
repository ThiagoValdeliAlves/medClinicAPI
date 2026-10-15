import type { MigrationInterface, QueryRunner } from 'typeorm'

import { UserRoles } from '../../../modules/users/entities/enums/userRole.js'
import { BcryptPasswordHasher } from '../../utils/bcrypt.js'

export class Migration1790624338026 implements MigrationInterface {
  name = 'Migration1790624338026'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasherService = new BcryptPasswordHasher()
    const passwordHashAdmin = await hasherService.hashPassword('Admin123')

    await queryRunner.query(
      `CREATE TYPE "public"."user_roles" AS ENUM('admin', 'secretary', 'doctor', 'patient')`
    )
    await queryRunner.query(
      `CREATE TABLE "users" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."user_roles" NOT NULL DEFAULT 'patient', "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    )

    await queryRunner.query(
      `INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)`,
      ['admin@admin.com', passwordHashAdmin, UserRoles.ADMIN]
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TYPE "public"."user_roles"`)
  }
}
