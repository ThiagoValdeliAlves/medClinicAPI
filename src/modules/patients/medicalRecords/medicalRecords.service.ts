import type { MedicalRecordsRepository } from './medicalRecords.repository.js'
import { AppDataSource } from '../../../@commons/database/dataSource.js'
import {
  DomainError,
  ERROR_CODE
} from '../../../@commons/errors/domain.error.js'
import type { TokenPayload } from '../../../@commons/utils/interfaces/tokenService.js'
import { Doctor } from '../../doctors/entities/doctor.entity.js'
import { UserRoles } from '../../users/entities/enums/userRole.js'
import { Patient } from '../entities/patient.entity.js'

export class MedicalRecordsService {
  constructor(
    private readonly medicalRecordsRepository: MedicalRecordsRepository
  ) {}

  async create(patientId: number, text: string, user: TokenPayload) {
    const isDoctor = user.roles.includes(UserRoles.DOCTOR)

    const isAdmin = user.roles.includes(UserRoles.ADMIN)

    const isSecretary = user.roles.includes(UserRoles.SECRETARY)

    if (!isDoctor || isAdmin || isSecretary) {
      throw new DomainError(
        'Apenas médicos podem escrever no prontuário',
        ERROR_CODE.ACESSO_NEGADO
      )
    }

    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: {
        id: patientId
      }
    })

    if (!patient) {
      throw new DomainError(
        'Paciente não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

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

    const hasLink = await this.medicalRecordsRepository.hasDoctorPatientLink(
      doctor.id,
      patientId
    )

    if (!hasLink) {
      throw new DomainError(
        'Você não possui vínculo com este paciente',
        ERROR_CODE.ACESSO_NEGADO
      )
    }

    const medicalRecord = await this.medicalRecordsRepository.create({
      patientId,
      doctorId: doctor.id,
      text
    })

    return {
      id: medicalRecord.id,
      patientId: medicalRecord.patientId,
      doctorId: medicalRecord.doctorId,
      text: medicalRecord.text,
      createdAt: medicalRecord.creationDate.toISOString()
    }
  }

  async findByPatientId(patientId: number, user: TokenPayload) {
    const isAdmin = user.roles.includes(UserRoles.ADMIN)
    const isDoctor = user.roles.includes(UserRoles.DOCTOR)
    const isSecretary = user.roles.includes(UserRoles.SECRETARY)

    if (!isAdmin && (isSecretary || !isDoctor)) {
      throw new DomainError(
        'Você não tem permissão para acessar este prontuário',
        ERROR_CODE.ACESSO_NEGADO
      )
    }

    const patient = await AppDataSource.getRepository(Patient).findOne({
      where: {
        id: patientId
      }
    })

    if (!patient) {
      throw new DomainError(
        'Paciente não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    if (!isAdmin) {
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

      const hasLink = await this.medicalRecordsRepository.hasDoctorPatientLink(
        doctor.id,
        patientId
      )

      if (!hasLink) {
        throw new DomainError(
          'Você não possui vínculo com este paciente',
          ERROR_CODE.ACESSO_NEGADO
        )
      }
    }

    const medicalRecords =
      await this.medicalRecordsRepository.findByPatientId(patientId)

    const total = medicalRecords.length

    return {
      data: medicalRecords.map((record) => ({
        id: record.id,
        patientId: record.patientId,
        doctorId: record.doctorId,
        text: record.text,
        createdAt: record.creationDate.toISOString()
      })),
      meta: {
        total,
        page: 1,
        pageSize: total,
        totalPages: total > 0 ? 1 : 0
      }
    }
  }
}
