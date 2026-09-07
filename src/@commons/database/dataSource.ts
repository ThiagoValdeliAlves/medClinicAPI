import 'dotenv/config'

import { DataSource } from 'typeorm'

import { User } from '../../modules/users/entities/user.entity.js'
import { configs } from '../config/env.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configs.databaseUrl,
  entities: [User],
  migrations: ['dist/@commons/database/migrations/*.js']
})
