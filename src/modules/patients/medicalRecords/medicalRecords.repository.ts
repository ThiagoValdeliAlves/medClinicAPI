import { In } from 'typeorm'

import { AppDataSource } from '../../../@commons/database/dataSource.js'
import { Appointments } from '../../appointments/entities/appointments.entity.js'
import { APPOINTMENT_STATUS } from '../../appointments/entities/enums/AppointmentsStatus.js'
import { MedicalRecords } from '../entities/medicalRecords.entity.js'

export class MedicalRecordsRepository {
  private readonly repository = AppDataSource.getRepository(MedicalRecords)

  async hasDoctorPatientLink(
    doctorId: number,
    patientId: number
  ): Promise<boolean> {
    const appointment = await AppDataSource.getRepository(Appointments).findOne(
      {
        where: {
          doctorId,
          patientId,
          status: In([APPOINTMENT_STATUS.IN_PROGRESS, APPOINTMENT_STATUS.DONE])
        },
        select: {
          id: true
        }
      }
    )

    return appointment !== null
  }

  async create(data: {
    patientId: number
    doctorId: number
    text: string
  }): Promise<MedicalRecords> {
    const medicalRecord = this.repository.create(data)

    return this.repository.save(medicalRecord)
  }

  async findByPatientId(patientId: number): Promise<MedicalRecords[]> {
    return this.repository.find({
      where: {
        patientId
      },
      order: {
        creationDate: 'DESC'
      }
    })
  }
}
