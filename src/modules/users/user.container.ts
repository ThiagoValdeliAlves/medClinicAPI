import { UserController } from './user.controller.js'
import { UserRepository } from './user.repository.js'
import { UserService } from './user.service.js'
import { BcryptPasswordHasher } from '../../@commons/utils/bcrypt.js'

const userRepository = new UserRepository()
const passwordHasher = new BcryptPasswordHasher()

const userService = new UserService(userRepository, passwordHasher)

export const userController = new UserController(userService)
