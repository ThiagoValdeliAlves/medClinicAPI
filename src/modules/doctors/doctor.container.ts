import { DoctorsController } from './doctor.controller.js'
import { DoctorsRepository } from './doctor.repository.js'
import { DoctorsService } from './doctor.service.js'
import { BcryptPasswordHasher } from '../../@commons/utils/bcrypt.js'
import { UserRepository } from '../users/user.repository.js'

const doctorsRepository = new DoctorsRepository()
const userRepository = new UserRepository()
const passwordHasher = new BcryptPasswordHasher()

const doctorsService = new DoctorsService(
  doctorsRepository,
  userRepository,
  passwordHasher
)

export const doctorsController = new DoctorsController(doctorsService)
