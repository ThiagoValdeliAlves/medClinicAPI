import { Router, type Request, type Response } from 'express'

import { appointmentsController } from './appointments.container.js'
import {
  authGuard,
  roleGuard
} from '../../@commons/middlewares/middleware.container.js'
import { UserRoles } from '../users/entities/enums/userRole.js'

const appointmentsRoutes = Router()

appointmentsRoutes.post(
  '',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN, UserRoles.SECRETARY),
  (req: Request, res: Response) => appointmentsController.create(req, res)
)

export default appointmentsRoutes
