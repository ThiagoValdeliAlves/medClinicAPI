import type { AppointmentsRepository } from './appointments.repository.js'
import type { Appointments } from './entities/appointments.entity.js'

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentsRepository) {}

  async create(input: {
    doctorId: number
    patientId: number
    startsAt: Date
  }): Promise<Appointments> {
    return await this.appointmentRepository.createAppointment(input)
  }
}
