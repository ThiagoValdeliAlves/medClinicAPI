import type { UserRoles } from './entities/enums/userRole.js'
import type { User } from './entities/user.entity.js'
import type { UserRepository } from './user.repository.js'
import { configs } from '../../@commons/configs/env.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import type { PasswordHasher } from '../../@commons/utils/interfaces/passwordHasher.js'
import type { TokenService } from '../../@commons/utils/interfaces/tokenService.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  private generateAuthResponse(user: User) {
    const accessToken = this.tokenService.generate({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles
    })

    return {
      accessToken
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    roles: UserRoles[]
  ) {
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new DomainError('Email já cadastrado', ERROR_CODE.CONFLITO)
    }

    const passwordHash = await this.passwordHasher.hashPassword(password)

    const user = await this.userRepository.register(
      name,
      email,
      passwordHash,
      roles
    )

    return this.generateAuthResponse(user)
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      await this.passwordHasher.comparePassword(password, configs.dummyHash)
      throw new DomainError(
        'Credenciais inválidas',
        ERROR_CODE.CREDENCIAIS_INVALIDAS
      )
    }

    const valid = await this.passwordHasher.comparePassword(
      password,
      user.passwordHash
    )
    if (!valid) {
      throw new DomainError(
        'Credenciais inválidas',
        ERROR_CODE.CREDENCIAIS_INVALIDAS
      )
    }

    return this.generateAuthResponse(user)
  }
}
