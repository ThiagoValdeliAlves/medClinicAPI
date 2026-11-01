import { AppointmentController } from './appointments.controller.js'
import { AppointmentsRepository } from './appointments.repository.js'
import { AppointmentService } from './appointments.service.js'

const appointmentsRepository = new AppointmentsRepository()

const appointmentsService = new AppointmentService(appointmentsRepository)

export const appointmentsController = new AppointmentController(
  appointmentsService
)
