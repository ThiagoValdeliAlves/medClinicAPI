import 'dotenv/config'

import { DataSource } from 'typeorm'

import { Appointments } from '../../modules/appointments/entities/appointments.entity.js'
import { Doctor } from '../../modules/doctors/entities/doctor.entity.js'
import { WorkSchedule } from '../../modules/doctors/entities/workSchedule.entity.js'
import { MedicalRecords } from '../../modules/patients/entities/medicalRecords.entity.js'
import { Patient } from '../../modules/patients/entities/patient.entity.js'
import { User } from '../../modules/users/entities/user.entity.js'
import { configs } from '../configs/env.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configs.databaseUrl,
  entities: [User, Patient, Doctor, WorkSchedule, Appointments, MedicalRecords],
  migrations: ['dist/@commons/database/migrations/*.js'],
  migrationsRun: true
})
