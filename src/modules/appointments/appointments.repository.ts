import { LessThan } from 'typeorm'

import { Appointments } from './entities/appointments.entity.js'
import { APPOINTMENT_STATUS } from './entities/enums/AppointmentsStatus.js'
import { AppDataSource } from '../../@commons/database/dataSource.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import {
  getDatePartsInTimeZone,
  toAbsoluteDayMinutes
} from '../../@commons/utils/utils.js'
import { Doctor } from '../doctors/entities/doctor.entity.js'
import { WorkSchedule } from '../doctors/entities/workSchedule.entity.js'
import { Patient } from '../patients/entities/patient.entity.js'

export class AppointmentsRepository {
  private readonly patientRepository = AppDataSource.getRepository(Patient)

  private readonly manager = AppDataSource.manager

  private readonly timeZone = 'America/Sao_Paulo'

  private checkConflict(
    appointments: Appointments[],
    newAppointment: {
      start: Date
      duration: number
    }
  ) {
    const newStart = newAppointment.start.getTime()
    const newEnd = newStart + newAppointment.duration * 60 * 1000

    const hasConflict = appointments.some((appointment) => {
      const appointmentStart = appointment.date.getTime()
      const appointmentEnd = appointmentStart + appointment.duration * 60 * 1000

      return newStart < appointmentEnd && newEnd > appointmentStart
    })

    if (hasConflict) {
      throw new DomainError(
        'Conflito de horário',
        ERROR_CODE.HORARIO_INDISPONIVEL
      )
    }
  }

  private checkWorkSchedule(
    appointment: Appointments,
    workSchedule: WorkSchedule
  ) {
    const { weekDay, hours, minutes } = getDatePartsInTimeZone(
      appointment.date,
      this.timeZone
    )

    const appointmentStartMinutes = hours * 60 + minutes

    const appointmentEndMinutes = appointmentStartMinutes + appointment.duration

    const weekDayConfiguration = workSchedule.shifts.filter(
      (shift) => shift.weekDay === weekDay
    )

    if (weekDayConfiguration.length === 0) {
      throw new DomainError('Fora de escala', ERROR_CODE.HORARIO_FORA_DA_ESCALA)
    }

    const isInShift = weekDayConfiguration.some((shift) => {
      const startTimeMinutes = toAbsoluteDayMinutes(shift.startTime)
      const endTimeMinutes = toAbsoluteDayMinutes(shift.endTime)

      return (
        appointment.duration === shift.slotDurationMinutes &&
        appointmentStartMinutes >= startTimeMinutes &&
        appointmentStartMinutes < endTimeMinutes &&
        appointmentEndMinutes <= endTimeMinutes
      )
    })

    if (!isInShift) {
      throw new DomainError(
        'Horário não permitido',
        ERROR_CODE.HORARIO_FORA_DA_ESCALA
      )
    }
  }

  async createAppointment(input: {
    doctorId: number
    patientId: number
    startsAt: Date
  }): Promise<Appointments> {
    const patient = await this.patientRepository.findOne({
      where: {
        id: input.patientId
      }
    })

    if (!patient) {
      throw new DomainError(
        'Paciente não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    return await this.manager.transaction(async (tx) => {
      const doctorRepository = tx.getRepository(Doctor)

      const doctor = await doctorRepository.findOne({
        where: {
          id: input.doctorId
        },
        lock: {
          mode: 'pessimistic_write'
        }
      })

      if (!doctor) {
        throw new DomainError(
          'Médico não encontrado',
          ERROR_CODE.RECURSO_NAO_ENCONTRADO
        )
      }

      const workScheduleRepository = tx.getRepository(WorkSchedule)

      const doctorWorkSchedule = await workScheduleRepository.findOne({
        where: {
          doctorId: input.doctorId
        }
      })

      if (!doctorWorkSchedule) {
        throw new DomainError(
          'Escala do médico não encontrada',
          ERROR_CODE.RECURSO_NAO_ENCONTRADO
        )
      }

      const { weekDay, hours, minutes } = getDatePartsInTimeZone(
        input.startsAt,
        this.timeZone
      )

      const appointmentStartMinutes = hours * 60 + minutes

      const shift = doctorWorkSchedule.shifts.find((shift) => {
        const startTimeMinutes = toAbsoluteDayMinutes(shift.startTime)
        const endTimeMinutes = toAbsoluteDayMinutes(shift.endTime)

        return (
          shift.weekDay === weekDay &&
          appointmentStartMinutes >= startTimeMinutes &&
          appointmentStartMinutes < endTimeMinutes
        )
      })

      if (!shift) {
        throw new DomainError(
          'Horário não permitido',
          ERROR_CODE.HORARIO_FORA_DA_ESCALA
        )
      }

      const appointmentRepository = tx.getRepository(Appointments)

      const appointment = appointmentRepository.create({
        doctorId: input.doctorId,
        patientId: input.patientId,
        date: input.startsAt,
        duration: shift.slotDurationMinutes,
        status: APPOINTMENT_STATUS.SCHEDULED
      })

      this.checkWorkSchedule(appointment, doctorWorkSchedule)

      const appointmentEnd = new Date(
        appointment.date.getTime() + appointment.duration * 60 * 1000
      )

      const currentAppointments = await appointmentRepository.find({
        where: {
          doctorId: input.doctorId,
          date: LessThan(appointmentEnd)
        }
      })

      this.checkConflict(currentAppointments, {
        start: appointment.date,
        duration: appointment.duration
      })

      return await appointmentRepository.save(appointment)
    })
  }

  async find(filters: {
    doctorId?: number
    patientId?: number
    status?: APPOINTMENT_STATUS
    from?: string
    to?: string
    page?: number
    pageSize?: number
  }) {
    const {
      doctorId,
      patientId,
      status,
      from,
      to,
      page = 1,
      pageSize = 20
    } = filters

    const query =
      AppDataSource.getRepository(Appointments).createQueryBuilder(
        'appointment'
      )

    if (doctorId) {
      query.andWhere('appointment.doctorId = :doctorId', {
        doctorId
      })
    }

    if (patientId) {
      query.andWhere('appointment.patientId = :patientId', {
        patientId
      })
    }

    if (status) {
      query.andWhere('appointment.status = :status', {
        status
      })
    }

    if (from) {
      query.andWhere('appointment.date >= :from', {
        from: `${from} 00:00:00`
      })
    }

    if (to) {
      query.andWhere('appointment.date <= :to', {
        to: `${to} 23:59:59.999`
      })
    }

    query
      .orderBy('appointment.date', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const [appointments, total] = await query.getManyAndCount()

    return {
      appointments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}
