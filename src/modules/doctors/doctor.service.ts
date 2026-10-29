import type { DoctorsRepository } from './doctor.repository.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import type { PasswordHasher } from '../../@commons/utils/interfaces/passwordHasher.js'
import type { UserRepository } from '../users/user.repository.js'

export interface ServiceRegisterDoctorDTO {
  name: string
  email: string
  password: string
  crm: string
}

export class DoctorsService {
  constructor(
    private readonly doctorRepository: DoctorsRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async register(data: ServiceRegisterDoctorDTO) {
    const emailExists = await this.userRepository.findByEmail(data.email)
    if (emailExists) {
      throw new DomainError(
        'E-mail já cadastrado.',
        ERROR_CODE.EMAIL_JA_CADASTRADO
      )
    }

    const crmExists = await this.doctorRepository.findByCRM(data.crm)
    if (crmExists) {
      throw new DomainError('CRM já cadastrado.', ERROR_CODE.CRM_JA_CADASTRADO)
    }

    const passwordHash = await this.passwordHasher.hashPassword(data.password)

    const doctor = await this.doctorRepository.register({
      name: data.name,
      email: data.email,
      passwordHash: passwordHash,
      crm: data.crm
    })

    return {
      id: doctor.id,
      crm: doctor.crm,
      user: {
        id: doctor.user.id,
        name: doctor.user.name,
        email: doctor.user.email,
        roles: doctor.user.roles
      }
    }
  }
}
