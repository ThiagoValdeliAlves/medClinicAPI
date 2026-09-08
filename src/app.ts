import express from 'express'

import testRoutes from './modules/routeTest/test.routes.js'
import userRoutes from './modules/users/user.routes.js'

const app = express()
app.use(express.json())

app.use('/users', userRoutes)
app.use('/testes', testRoutes)

export default app
