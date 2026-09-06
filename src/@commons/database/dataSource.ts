import 'dotenv/config'

import { DataSource } from 'typeorm'

import { User } from '../../modules/users/entities/user.entity.js'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined')
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User],
  migrations: ['dist/@commons/database/migrations/*.js']
})
