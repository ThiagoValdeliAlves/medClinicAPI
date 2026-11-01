import express from 'express'

import appointmentsRoutes from './modules/appointments/appointments.routes.js'
import doctorsRoutes from './modules/doctors/doctor.routes.js'
import healthRoutes from './modules/health/health.routes.js'
import patientRoutes from './modules/patients/patient.routes.js'
import userRoutes from './modules/users/user.routes.js'

const app = express()
const apiRouter = express.Router()

app.use(express.json())

apiRouter.use('/health', healthRoutes)
apiRouter.use('/auth', userRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/patients', patientRoutes)
apiRouter.use('/doctors', doctorsRoutes)
apiRouter.use('/appointments', appointmentsRoutes)

app.use('/api/v1', apiRouter)
export default app
