import type { Request, Response, NextFunction } from 'express'

import { ERROR_CODE, HTTP_STATUS_BY_CODE } from '../errors/domain.error.js'
import type { TokenService } from '../utils/interfaces/tokenService.js'

export class AuthGuard {
  constructor(private tokenService: TokenService) {}

  execute = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(HTTP_STATUS_BY_CODE.NAO_AUTENTICADO).json({
        statusCode: HTTP_STATUS_BY_CODE.NAO_AUTENTICADO,
        error: ERROR_CODE.NAO_AUTENTICADO,
        message: ERROR_CODE.NAO_AUTENTICADO
      })
    }

    const [x, token] = authHeader.split(' ')
    if (x !== 'Bearer' || !token) {
      return res.status(HTTP_STATUS_BY_CODE.NAO_AUTENTICADO).json({
        statusCode: HTTP_STATUS_BY_CODE.NAO_AUTENTICADO,
        error: ERROR_CODE.NAO_AUTENTICADO,
        message: ERROR_CODE.NAO_AUTENTICADO
      })
    }

    try {
      const payload = this.tokenService.verify(token)

      res.locals.user = payload

      next()
    } catch {
      return res.status(HTTP_STATUS_BY_CODE.NAO_AUTENTICADO).json({
        statusCode: HTTP_STATUS_BY_CODE.NAO_AUTENTICADO,
        error: ERROR_CODE.NAO_AUTENTICADO,
        message: ERROR_CODE.NAO_AUTENTICADO
      })
    }
  }
}
