import { ILike } from 'typeorm'

import { Doctor } from './entities/doctor.entity.js'
import { AppDataSource } from '../../@commons/database/dataSource.js'
import { UserRoles } from '../users/entities/enums/userRole.js'
import { User } from '../users/entities/user.entity.js'

export interface RegisterDoctorDTO {
  name: string
  email: string
  passwordHash: string
  crm: string
}

export class DoctorsRepository {
  private readonly repository = AppDataSource.getRepository(Doctor)

  async register(data: RegisterDoctorDTO): Promise<Doctor> {
    return AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User)
      const doctorRepository = manager.getRepository(Doctor)

      const user = userRepository.create({
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        roles: [UserRoles.DOCTOR]
      })

      const savedUser = await userRepository.save(user)

      const doctor = doctorRepository.create({
        crm: data.crm,
        user: savedUser
      })

      return doctorRepository.save(doctor)
    })
  }

  async findByCRM(crm: string) {
    return this.repository.findOneBy({ crm })
  }

  async find(page = 1, pageSize = 10, name?: string) {
    return this.repository.findAndCount({
      relations: {
        user: true
      },
      ...(name
        ? {
            where: {
              user: {
                name: ILike(`%${name}%`)
              }
            }
          }
        : {}),
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  }
}
