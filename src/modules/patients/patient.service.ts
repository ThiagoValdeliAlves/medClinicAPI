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
}
