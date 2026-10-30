import { Router, type Request, type Response } from 'express'

import {
  doctorsController,
  workScheduleController
} from './doctor.container.js'
import {
  authGuard,
  roleGuard
} from '../../@commons/middlewares/middleware.container.js'
import { UserRoles } from '../users/entities/enums/userRole.js'

const doctorsRoutes = Router()

doctorsRoutes.post(
  '',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN),
  (req: Request, res: Response) => doctorsController.register(req, res)
)

doctorsRoutes.get('', authGuard.execute, (req: Request, res: Response) =>
  doctorsController.find(req, res)
)

doctorsRoutes.get('/:id', authGuard.execute, (req: Request, res: Response) =>
  doctorsController.findById(req, res)
)

doctorsRoutes.put(
  '/:doctorId/work-schedule',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN),
  (req: Request, res: Response) => workScheduleController.update(req, res)
)

export default doctorsRoutes
