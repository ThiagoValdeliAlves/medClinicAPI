import { User } from './entities/user.entity.js'
import { AppDataSource } from '../../@commons/database/dataSource.js'

export class UserRepository {
  private readonly repository = AppDataSource.getRepository(User)

  async register(email: string, passwordHash: string): Promise<User> {
    const user = this.repository.create({
      email,
      passwordHash
    })

    return this.repository.save(user)
  }

  async findByEmail(email: string) {
    return this.repository.findOneBy({ email })
  }
}
