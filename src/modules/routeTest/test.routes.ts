import { Router } from 'express'

import { testController } from './test.controller.js'
import {
  authGuard,
  roleGuard
} from '../../@commons/middlewares/middleware.container.js'
import { UserRoles } from '../users/entities/enums/userRole.js'

const testRoutes = Router()

testRoutes.get(
  '/',
  authGuard.execute,
  roleGuard.execute(UserRoles.ADMIN),
  testController
)

export default testRoutes
