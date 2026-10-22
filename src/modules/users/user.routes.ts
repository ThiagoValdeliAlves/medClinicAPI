import { Router, type Request, type Response } from 'express'

import { UserRoles } from './entities/enums/userRole.js'
import { userController } from './user.container.js'
import {
  authGuard,
  roleGuard
} from '../../@commons/middlewares/middleware.container.js'
import type { TokenPayload } from '../../@commons/utils/interfaces/tokenService.js'

const userRoutes = Router()

userRoutes.post('/login', (req: Request, res: Response) =>
  userController.login(req, res)
)

userRoutes.get(
  '/me',
  authGuard.execute,
  (req: Request, res: Response<unknown, { user: TokenPayload }>) => {
    userController.me(req, res)
  }
)

userRoutes.post(
  '/register',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN),
  (req, res) => userController.register(req, res)
)

export default userRoutes
