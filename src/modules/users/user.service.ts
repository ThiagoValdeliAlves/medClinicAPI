import type { User } from './entities/user.entity.js'
import { InvalidCredentials } from './errors/invalidCredentials.error.js'
import type { UserRepository } from './user.repository.js'
import { ConflictError } from '../../@commons/errors/conflict.error.js'
import type { PasswordHasher } from '../../@commons/utils/interfaces/passwordHasher.js'
import type { TokenService } from '../../@commons/utils/interfaces/tokenService.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  private generateAuthResponse(user: User) {
    const token = this.tokenService.generate({
      id: user.id,
      email: user.email,
      role: user.role
    })

    return {
      token,
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  }

  async register(email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new ConflictError('Email já cadastrado')
    }

    const passwordHash = await this.passwordHasher.hashPassword(password)

    const user = await this.userRepository.register(email, passwordHash)

    return this.generateAuthResponse(user)
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new InvalidCredentials('Credenciais inválidas')
    }

    const valid = await this.passwordHasher.comparePassword(
      password,
      user.passwordHash
    )
    if (!valid) {
      throw new InvalidCredentials('Credenciais inválidas')
    }

    return this.generateAuthResponse(user)
  }
}
