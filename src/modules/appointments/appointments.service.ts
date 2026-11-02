import type { AppointmentsRepository } from './appointments.repository.js'
import type { Appointments } from './entities/appointments.entity.js'
import { APPOINTMENT_STATUS } from './entities/enums/AppointmentsStatus.js'
import { AppDataSource } from '../../@commons/database/dataSource.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import type { TokenPayload } from '../../@commons/utils/interfaces/tokenService.js'
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

  async findById(id: number, user: TokenPayload) {
    const appointment = await this.appointmentRepository.findById(id)

    if (!appointment) {
      throw new DomainError(
        'Agendamento não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    const isAdmin = user.roles.includes(UserRoles.ADMIN)
    const isDoctor = user.roles.includes(UserRoles.DOCTOR)

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

      if (appointment.doctorId !== doctor.id) {
        throw new DomainError(
          'Você não tem permissão para acessar este agendamento',
          ERROR_CODE.ACESSO_NEGADO
        )
      }
    }

    return this.appointmentMapper(appointment)
  }

  async updateStatus(
    id: number,
    status: APPOINTMENT_STATUS,
    user: TokenPayload
  ) {
    const appointment = await this.appointmentRepository.findById(id)

    if (!appointment) {
      throw new DomainError(
        'Agendamento não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    const isAdmin = user.roles.includes(UserRoles.ADMIN)
    const isSecretary = user.roles.includes(UserRoles.SECRETARY)
    const isDoctor = user.roles.includes(UserRoles.DOCTOR)

    let isAppointmentDoctor = false

    if (isDoctor) {
      const doctor = await AppDataSource.getRepository(Doctor).findOne({
        where: {
          user: {
            id: user.id
          }
        }
      })

      if (doctor) {
        isAppointmentDoctor = appointment.doctorId === doctor.id
      }
    }

    const transitions = {
      [APPOINTMENT_STATUS.SCHEDULED]: {
        [APPOINTMENT_STATUS.IN_PROGRESS]: isAdmin || isAppointmentDoctor,

        [APPOINTMENT_STATUS.CANCELLED]:
          isAdmin || isSecretary || isAppointmentDoctor
      },

      [APPOINTMENT_STATUS.IN_PROGRESS]: {
        [APPOINTMENT_STATUS.DONE]: isAdmin || isAppointmentDoctor,

        [APPOINTMENT_STATUS.CANCELLED]: isAdmin || isAppointmentDoctor
      }
    }

    const allowedTransitions = transitions[appointment.status]

    const isValidTransition =
      allowedTransitions &&
      Object.prototype.hasOwnProperty.call(allowedTransitions, status)

    if (!isValidTransition) {
      throw new DomainError(
        'Transição de status inválida',
        ERROR_CODE.TRANSICAO_INVALIDA
      )
    }

    if (!allowedTransitions[status]) {
      throw new DomainError(
        'Você não tem permissão para realizar esta transição',
        ERROR_CODE.ACESSO_NEGADO
      )
    }

    const updatedAppointment = await this.appointmentRepository.updateStatus(
      id,
      status
    )

    if (!updatedAppointment) {
      throw new DomainError(
        'Agendamento não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    return this.appointmentMapper(updatedAppointment)
  }
}
