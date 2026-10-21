import type { UserRoles } from '../../../modules/users/entities/enums/userRole.js'

export interface TokenPayload {
  id: number
  name: string
  email: string
  roles: UserRoles[]
}

export interface TokenService {
  generate(payload: TokenPayload): string
  verify(token: string): TokenPayload
}
