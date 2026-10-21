import type { UserRoles } from './entities/enums/userRole.js'
import { User } from './entities/user.entity.js'
import { AppDataSource } from '../../@commons/database/dataSource.js'

export class UserRepository {
  private readonly repository = AppDataSource.getRepository(User)

  async register(
    name: string,
    email: string,
    passwordHash: string,
    roles: UserRoles[]
  ): Promise<User> {
    const user = this.repository.create({
      name,
      email,
      passwordHash,
      roles
    })

    return this.repository.save(user)
  }

  async findByEmail(email: string) {
    return this.repository.findOneBy({ email })
  }
}
