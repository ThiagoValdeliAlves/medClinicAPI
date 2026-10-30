import { AppDataSource } from '../../../@commons/database/dataSource.js'
import type { WorkScheduleShift } from '../entities/workSchedule.entity.js'
import { WorkSchedule } from '../entities/workSchedule.entity.js'

export interface UpdateWorkScheduleDTO {
  doctorId: number
  shifts: WorkScheduleShift[]
}

export class WorkSchedulesRepository {
  private readonly repository = AppDataSource.getRepository(WorkSchedule)

  async findByDoctorId(doctorId: number) {
    return this.repository.findOneBy({ doctorId })
  }

  async save(data: UpdateWorkScheduleDTO): Promise<WorkSchedule> {
    let workSchedule = await this.findByDoctorId(data.doctorId)

    if (!workSchedule) {
      workSchedule = this.repository.create({
        doctorId: data.doctorId,
        shifts: data.shifts
      })
    } else {
      workSchedule.shifts = data.shifts
    }

    return this.repository.save(workSchedule)
  }

  async deleteByDoctorId(doctorId: number) {
    return this.repository.delete({ doctorId })
  }
}
