import { Router } from 'express'

import { userController } from '../../container.js'

const userRoutes = Router()

userRoutes.post('/register', (req, res) => userController.register(req, res))

export default userRoutes
