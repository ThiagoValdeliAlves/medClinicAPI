import { Router, type Request, type Response } from 'express'

import { appointmentsController } from './appointments.container.js'
import {
  authGuard,
  roleGuard
} from '../../@commons/middlewares/middleware.container.js'
import type { TokenPayload } from '../../@commons/utils/interfaces/tokenService.js'
import { UserRoles } from '../users/entities/enums/userRole.js'

const appointmentsRoutes = Router()

appointmentsRoutes.post(
  '',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN, UserRoles.SECRETARY),
  (req: Request, res: Response) => appointmentsController.create(req, res)
)

appointmentsRoutes.get(
  '',
  authGuard.execute,
  (req: Request, res: Response<unknown, { user: TokenPayload }>) =>
    appointmentsController.find(req, res)
)

appointmentsRoutes.get(
  '/:id',
  authGuard.execute,
  (req: Request, res: Response<unknown, { user: TokenPayload }>) =>
    appointmentsController.findById(req, res)
)

appointmentsRoutes.patch(
  '/:id/status',
  authGuard.execute,
  (req: Request, res: Response<unknown, { user: TokenPayload }>) =>
    appointmentsController.updateStatus(req, res)
)

export default appointmentsRoutes
