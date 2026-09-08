import type { UserRoles } from '../../../modules/users/entities/enums/userRole.js'

export interface TokenPayload {
  id: number
  email: string
  role: UserRoles
}

export interface TokenService {
  generate(payload: TokenPayload): string
  verify(token: string): TokenPayload
}
