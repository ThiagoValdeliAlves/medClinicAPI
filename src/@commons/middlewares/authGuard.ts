import type { Request, Response, NextFunction } from 'express'

import type { TokenService } from '../utils/interfaces/tokenService.js'

export class AuthGuard {
  constructor(private tokenService: TokenService) {}

  execute = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        message: 'Token não informado'
      })
    }

    const [x, token] = authHeader.split(' ')
    if (x !== 'Bearer' || !token) {
      return res.status(401).json({
        message: 'Token não informado'
      })
    }

    try {
      const payload = this.tokenService.verify(token)

      res.locals.user = payload

      next()
    } catch {
      return res.status(401).json({
        message: 'Token inválido ou expirado'
      })
    }
  }
}
