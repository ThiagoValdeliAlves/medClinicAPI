import type { DoctorsRepository } from './doctor.repository.js'
import type { WorkSchedulesRepository } from './workSchedule/workSchedule.repository.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import type { PasswordHasher } from '../../@commons/utils/interfaces/passwordHasher.js'
import type { AppointmentsRepository } from '../appointments/appointments.repository.js'
import type { UserRepository } from '../users/user.repository.js'

export interface ServiceRegisterDoctorDTO {
  name: string
  email: string
  password: string
  crm: string
}

export class DoctorsService {
  constructor(
    private readonly doctorRepository: DoctorsRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly workSchedulesRepository: WorkSchedulesRepository,
    private readonly appointmentsRepository: AppointmentsRepository
  ) {}

  async register(data: ServiceRegisterDoctorDTO) {
    const emailExists = await this.userRepository.findByEmail(data.email)
    if (emailExists) {
      throw new DomainError(
        'E-mail já cadastrado.',
        ERROR_CODE.EMAIL_JA_CADASTRADO
      )
    }

    const crmExists = await this.doctorRepository.findByCRM(data.crm)
    if (crmExists) {
      throw new DomainError('CRM já cadastrado.', ERROR_CODE.CRM_JA_CADASTRADO)
    }

    const passwordHash = await this.passwordHasher.hashPassword(data.password)

    const doctor = await this.doctorRepository.register({
      name: data.name,
      email: data.email,
      passwordHash: passwordHash,
      crm: data.crm
    })

    return {
      id: doctor.id,
      crm: doctor.crm,
      user: {
        id: doctor.user.id,
        name: doctor.user.name,
        email: doctor.user.email,
        roles: doctor.user.roles
      }
    }
  }

  async find(page = 1, pageSize = 20, name?: string) {
    const [doctors, total] = await this.doctorRepository.find(
      page,
      pageSize,
      name
    )

    return {
      data: doctors.map((doctor) => ({
        id: doctor.id,
        crm: doctor.crm,
        user: {
          id: doctor.user.id,
          name: doctor.user.name,
          email: doctor.user.email,
          roles: doctor.user.roles
        }
      })),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  }

  async findById(id: number) {
    const doctor = await this.doctorRepository.findById(id)

    if (!doctor) {
      throw new DomainError(
        'Médico não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    return {
      id: doctor.id,
      crm: doctor.crm,
      user: {
        id: doctor.user.id,
        name: doctor.user.name,
        email: doctor.user.email,
        roles: doctor.user.roles
      }
    }
  }

  async getCalendar(doctorId: number, from: string, to: string) {
    const doctor = await this.doctorRepository.findById(doctorId)
    if (!doctor) {
      throw new DomainError(
        'Médico não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    const workSchedule =
      await this.workSchedulesRepository.findByDoctorId(doctorId)

    const startDate = new Date(`${from}T00:00:00-03:00`)

    const [year, month, day] = to.split('-').map(Number)

    const nextDay = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day) + 1)
    )

    const nextDayString = nextDay.toISOString().slice(0, 10)

    const endDate = new Date(`${nextDayString}T00:00:00-03:00`)

    const appointments =
      await this.appointmentsRepository.findActiveByDoctorAndPeriod(
        doctorId,
        startDate,
        endDate
      )

    return {
      workSchedule: {
        shifts: workSchedule?.shifts ?? []
      },
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        patientId: appointment.patientId,
        startsAt: appointment.date.toISOString(),
        endsAt: new Date(
          appointment.date.getTime() + appointment.duration * 60 * 1000
        ).toISOString(),
        status: appointment.status
      }))
    }
  }
}
