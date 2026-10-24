import { Patient } from './entities/patient.entity.js'
import { AppDataSource } from '../../@commons/database/dataSource.js'

export class PatientsRepository {
  private readonly repository = AppDataSource.getRepository(Patient)

  async register(name: string, cpf: string): Promise<Patient> {
    const patient = this.repository.create({
      name,
      cpf
    })

    return this.repository.save(patient)
  }

  async findByCpf(cpf: string) {
    return this.repository.findOneBy({ cpf })
  }
}
