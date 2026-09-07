import jwt from 'jsonwebtoken'

import type { TokenPayload, TokenService } from './interfaces/tokenService.js'

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {}

  generate(payload: TokenPayload) {
    return jwt.sign(payload, this.secret, { expiresIn: '1h' })
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret)
    if (typeof decoded === 'string') {
      throw new Error('Payload do JWT inválido')
    }

    return decoded as TokenPayload
  }
}
