import type { NextFunction, Request, Response } from 'express'

import type { UserRoles } from '../../modules/users/entities/enums/userRole.js'
import type { TokenPayload } from '../utils/interfaces/tokenService.js'

export class RoleGuard {
  execute(...roles: UserRoles[]) {
    return (
      req: Request,
      res: Response<unknown, { user: TokenPayload }>,
      next: NextFunction
    ) => {
      if (!roles.includes(res.locals.user.role)) {
        return res.status(403).json({
          message: 'Acesso negado'
        })
      }

      next()
    }
  }
}
