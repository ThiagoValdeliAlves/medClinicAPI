import express from 'express'

import healthRoutes from './modules/health/health.routes.js'
import userRoutes from './modules/users/user.routes.js'

const app = express()
const apiRouter = express.Router()

app.use(express.json())

apiRouter.use('/health', healthRoutes)
apiRouter.use('/auth', userRoutes)
apiRouter.use('/users', userRoutes)

app.use('/api/v1', apiRouter)
export default app
