import { Router } from 'express'

import { userController } from './user.container.js'

const userRoutes = Router()

userRoutes.post('/register', (req, res) => userController.register(req, res))

export default userRoutes
