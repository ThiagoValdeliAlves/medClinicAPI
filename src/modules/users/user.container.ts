import { UserController } from './user.controller.js'
import { UserRepository } from './user.repository.js'
import { UserService } from './user.service.js'
import { configs } from '../../@commons/configs/env.js'
import { BcryptPasswordHasher } from '../../@commons/utils/bcrypt.js'
import { JwtTokenService } from '../../@commons/utils/jsonWebToken.js'

const userRepository = new UserRepository()
const passwordHasher = new BcryptPasswordHasher()
const tokenService = new JwtTokenService(configs.jwtSecret)

const userService = new UserService(
  userRepository,
  passwordHasher,
  tokenService
)

export const userController = new UserController(userService)
