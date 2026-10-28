import type { PatientsRepository } from './patient.repository.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'

export class PatientService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  async register(name: string, cpf: string) {
    const existingPatient = await this.patientsRepository.findByCpf(cpf)
    if (existingPatient) {
      throw new DomainError('CPF já cadastrado', ERROR_CODE.CPF_JA_CADASTRADO)
    }

    const patient = await this.patientsRepository.register(name, cpf)

    return {
      id: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      createdAt: patient.creationDate
    }
  }

  async find(page = 1, pageSize = 10, name?: string) {
    const [patients, total] = await this.patientsRepository.find(
      page,
      pageSize,
      name
    )

    return {
      items: patients.map((patient) => ({
        id: patient.id,
        name: patient.name,
        cpf: patient.cpf,
        createdAt: patient.creationDate
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  async findById(id: number) {
    const patient = await this.patientsRepository.findById(id)

    if (!patient) {
      throw new DomainError(
        'Paciente não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    return {
      id: patient.id,
      name: patient.name,
      cpf: patient.cpf,
      createdAt: patient.creationDate
    }
  }

  async updateName(id: number, name: string) {
    const patient = await this.patientsRepository.updateName(id, name)

    if (!patient) {
      throw new DomainError(
        'Paciente não encontrado',
        ERROR_CODE.RECURSO_NAO_ENCONTRADO
      )
    }

    return patient
  }

  async deleteById(id: number): Promise<void> {
    const deleted = await this.patientsRepository.deleteById(id)

    if (!deleted) {
      throw new DomainError(
        'Paciente não encontrado',
        ERROR_CODE.PACIENTE_INDISPONIVEL
      )
    }
  }
}
