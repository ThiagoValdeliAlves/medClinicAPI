import { UserController } from './modules/users/user.controller.js'
import { UserRepository } from './modules/users/user.repository.js'
import { UserService } from './modules/users/user.service.js'

const userRepository = new UserRepository()

const userService = new UserService(userRepository)

export const userController = new UserController(userService)
