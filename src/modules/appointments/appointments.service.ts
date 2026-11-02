import type { AppointmentsRepository } from './appointments.repository.js'
import type { Appointments } from './entities/appointments.entity.js'
import type { APPOINTMENT_STATUS } from './entities/enums/AppointmentsStatus.js'
import { AppDataSource } from '../../@commons/database/dataSource.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import { Doctor } from '../doctors/entities/doctor.entity.js'
import { UserRoles } from '../users/entities/enums/userRole.js'

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentsRepository) {}

  private appointmentMapper(appointment: Appointments) {
    return {
      id: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      startsAt: appointment.date.toISOString(),
      endsAt: new Date(
        appointment.date.getTime() + appointment.duration * 60 * 1000
      ).toISOString(),
      status: appointment.status
    }
  }

  async create(input: { doctorId: number; patientId: number; startsAt: Date }) {
    const appointment =
      await this.appointmentRepository.createAppointment(input)

    return this.appointmentMapper(appointment)
  }

  async find(
    filters: {
      doctorId?: number
      patientId?: number
      status?: APPOINTMENT_STATUS
      from?: string
      to?: string
      page?: number
      pageSize?: number
    },
    user: {
      id: number
      roles: UserRoles[]
    }
  ) {
    const isAdmin = user.roles.includes(UserRoles.ADMIN)
    const isDoctor = user.roles.includes(UserRoles.DOCTOR)

    let doctorId = filters.doctorId

    if (isDoctor && !isAdmin) {
      const doctor = await AppDataSource.getRepository(Doctor).findOne({
        where: {
          user: {
            id: user.id
          }
        }
      })

      if (!doctor) {
        throw new DomainError(
          'Médico não encontrado',
          ERROR_CODE.RECURSO_NAO_ENCONTRADO
        )
      }

      doctorId = doctor.id
    }

    const result = await this.appointmentRepository.find({
      ...filters,
      ...(doctorId !== undefined ? { doctorId } : {})
    })

    return {
      data: result.appointments.map((appointment) =>
        this.appointmentMapper(appointment)
      ),
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    }
  }
}
