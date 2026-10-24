import 'dotenv/config'

import { DataSource } from 'typeorm'

import { Patient } from '../../modules/patients/entities/patient.entity.js'
import { User } from '../../modules/users/entities/user.entity.js'
import { configs } from '../configs/env.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configs.databaseUrl,
  entities: [User, Patient],
  migrations: ['dist/@commons/database/migrations/*.js']
})
