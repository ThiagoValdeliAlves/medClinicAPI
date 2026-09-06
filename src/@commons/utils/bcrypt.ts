import bcrypt from 'bcrypt'

import type { PasswordHasher } from './interfaces/passwordHasher.js'

export class BcryptPasswordHasher implements PasswordHasher {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(9)
    return bcrypt.hash(password, salt)
  }

  comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
