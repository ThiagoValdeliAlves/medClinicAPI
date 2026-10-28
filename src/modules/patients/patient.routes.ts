import { Router, type Request, type Response } from 'express'

import { patientController } from './patient.container.js'
import {
  authGuard,
  roleGuard
} from '../../@commons/middlewares/middleware.container.js'
import { UserRoles } from '../users/entities/enums/userRole.js'

const patientRoutes = Router()

patientRoutes.post(
  '',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN, UserRoles.SECRETARY),
  (req: Request, res: Response) => patientController.register(req, res)
)

patientRoutes.get('', authGuard.execute, (req: Request, res: Response) =>
  patientController.find(req, res)
)

patientRoutes.get('/:id', authGuard.execute, (req: Request, res: Response) =>
  patientController.findById(req, res)
)

patientRoutes.patch(
  '/:id',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN, UserRoles.SECRETARY),
  (req: Request, res: Response) => patientController.updateName(req, res)
)

export default patientRoutes
