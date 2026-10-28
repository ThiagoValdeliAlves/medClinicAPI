import { ILike } from 'typeorm'

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

  async find(page = 1, pageSize = 10, name?: string) {
    return this.repository.findAndCount({
      ...(name ? { where: { name: ILike(`%${name}%`) } } : {}),
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  }

  async findById(id: number) {
    return this.repository.findOneBy({ id })
  }

  async updateName(id: number, name: string): Promise<Patient | null> {
    const patient = await this.repository.findOneBy({ id })

    if (!patient) {
      return null
    }

    patient.name = name

    return this.repository.save(patient)
  }
}
