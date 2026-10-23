import type { NextFunction, Request, Response } from 'express'

import type { UserRoles } from '../../modules/users/entities/enums/userRole.js'
import { ERROR_CODE, HTTP_STATUS_BY_CODE } from '../errors/domain.error.js'
import type { TokenPayload } from '../utils/interfaces/tokenService.js'

export class RoleGuard {
  execute(...roles: UserRoles[]) {
    return (
      req: Request,
      res: Response<unknown, { user: TokenPayload }>,
      next: NextFunction
    ) => {
      if (!res.locals.user.roles.some((role) => roles.includes(role))) {
        return res.status(HTTP_STATUS_BY_CODE.ACESSO_NEGADO).json({
          statusCode: HTTP_STATUS_BY_CODE.ACESSO_NEGADO,
          error: ERROR_CODE.ACESSO_NEGADO,
          message: ERROR_CODE.ACESSO_NEGADO
        })
      }

      next()
    }
  }
}
