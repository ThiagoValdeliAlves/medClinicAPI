import type { UserRepository } from './user.repository.js'
import type { PasswordHasher } from '../../@commons/utils/interfaces/passwordHasher.js'

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async register(email: string, password: string) {
    const passwordHash = await this.passwordHasher.hashPassword(password)

    const user = await this.userRepository.register(email, passwordHash)

    const token = user /// TODO: criar token jwt

    return token
  }
}
