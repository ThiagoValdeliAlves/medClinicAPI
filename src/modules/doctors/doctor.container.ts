import { DoctorsController } from './doctor.controller.js'
import { DoctorsRepository } from './doctor.repository.js'
import { DoctorsService } from './doctor.service.js'
import { WorkSchedulesController } from './workSchedule/workSchedule.controller.js'
import { WorkSchedulesRepository } from './workSchedule/workSchedule.repository.js'
import { WorkSchedulesService } from './workSchedule/workSchedule.service.js'
import { BcryptPasswordHasher } from '../../@commons/utils/bcrypt.js'
import { AppointmentsRepository } from '../appointments/appointments.repository.js'
import { UserRepository } from '../users/user.repository.js'

const doctorsRepository = new DoctorsRepository()
const userRepository = new UserRepository()
const passwordHasher = new BcryptPasswordHasher()
const workScheduleRepository = new WorkSchedulesRepository()
const appointmentRepository = new AppointmentsRepository()

const doctorsService = new DoctorsService(
  doctorsRepository,
  userRepository,
  passwordHasher,
  workScheduleRepository,
  appointmentRepository
)

const workScheduleService = new WorkSchedulesService(
  workScheduleRepository,
  doctorsRepository
)

export const doctorsController = new DoctorsController(doctorsService)
export const workScheduleController = new WorkSchedulesController(
  workScheduleService
)
