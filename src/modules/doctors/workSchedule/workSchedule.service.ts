import {
  DomainError,
  ERROR_CODE
} from '../../../@commons/errors/domain.error.js'
import type { DoctorsRepository } from '../doctor.repository.js'
import type { WorkSchedulesRepository } from './workSchedule.repository.js'
import type { WorkScheduleShift } from '../entities/workSchedule.entity.js'

export interface ServiceUpdateWorkScheduleDTO {
  doctorId: number
  shifts: WorkScheduleShift[]
}

export class WorkSchedulesService {
  constructor(
    private readonly workScheduleRepository: WorkSchedulesRepository,
    private readonly doctorRepository: DoctorsRepository
  ) {}

  async update(data: ServiceUpdateWorkScheduleDTO) {
    const doctor = await this.doctorRepository.findById(data.doctorId)
    if (!doctor) {
      throw new DomainError(
        'Médico não encontrado.',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    const workSchedule = await this.workScheduleRepository.save({
      doctorId: data.doctorId,
      shifts: data.shifts
    })

    return {
      shifts: workSchedule.shifts
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

    const workSchedule = await this.workScheduleRepository.findByDoctorId(
      doctor.id
    )
    if (!workSchedule) {
      throw new DomainError(
        'Escala não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    return {
      shifts: workSchedule.shifts
    }
  }
}
