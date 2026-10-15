import express from 'express'

import healthRoutes from './modules/health/health.routes.js'
import userRoutes from './modules/users/user.routes.js'

const app = express()
app.use(express.json())

app.use('/api/v1/health', healthRoutes)
app.use('/api/v1/auth', userRoutes)
app.use('/api/v1/users', userRoutes)

export default app
