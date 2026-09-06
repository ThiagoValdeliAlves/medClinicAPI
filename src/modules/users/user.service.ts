import type { UserRepository } from './user.repository.js'

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(email: string, password: string) {
    const passwordHash = password /// TODO: transformar em hash

    const user = await this.userRepository.register(email, passwordHash)

    const token = user /// TODO: criar token jwt

    return token
  }
}
