import { Router } from 'express'

import { userController } from './user.container.js'

const userRoutes = Router()

userRoutes.post('/register', (req, res) => userController.register(req, res))
userRoutes.post('/login', (req, res) => userController.login(req, res))

export default userRoutes
