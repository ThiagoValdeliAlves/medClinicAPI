import type { UserRepository } from './user.repository.js'
import type { PasswordHasher } from '../../@commons/utils/interfaces/passwordHasher.js'
import type { TokenService } from '../../@commons/utils/interfaces/tokenService.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async register(email: string, password: string) {
    const passwordHash = await this.passwordHasher.hashPassword(password)

    const user = await this.userRepository.register(email, passwordHash)

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
}
