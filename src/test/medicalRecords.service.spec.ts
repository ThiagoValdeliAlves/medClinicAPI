import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ERROR_CODE } from '../@commons/errors/domain.error.js'
import type { TokenPayload } from '../@commons/utils/interfaces/tokenService.js'
import { Doctor } from '../modules/doctors/entities/doctor.entity.js'
import { Patient } from '../modules/patients/entities/patient.entity.js'
import type { MedicalRecordsRepository } from '../modules/patients/medicalRecords/medicalRecords.repository.js'
import { MedicalRecordsService } from '../modules/patients/medicalRecords/medicalRecords.service.js'
import { UserRoles } from '../modules/users/entities/enums/userRole.js'

const mocks = vi.hoisted(() => ({
  getRepository: vi.fn(),
  patientFindOne: vi.fn(),
  doctorFindOne: vi.fn(),
  hasDoctorPatientLink: vi.fn(),
  create: vi.fn(),
  findByPatientId: vi.fn()
}))

vi.mock('../@commons/database/dataSource.js', () => ({
  AppDataSource: {
    getRepository: mocks.getRepository
  }
}))

describe('MedicalRecordsService', () => {
  let medicalRecordsService: MedicalRecordsService

  const patient = {
    id: 1,
    name: 'Thiago',
    cpf: '12345678900'
  } as Patient

  const doctor = {
    id: 10
  } as Doctor

  const medicalRecord = {
    id: 100,
    patientId: 1,
    doctorId: 10,
    text: 'Paciente apresenta melhora clínica',
    creationDate: new Date('2026-01-01T10:00:00.000Z')
  }

  const doctorUser: TokenPayload = {
    id: 10,
    name: 'Dr. Thiago',
    email: 'doctor@email.com',
    roles: [UserRoles.DOCTOR]
  }

  const adminUser: TokenPayload = {
    id: 20,
    name: 'Admin',
    email: 'admin@email.com',
    roles: [UserRoles.ADMIN]
  }

  const secretaryUser: TokenPayload = {
    id: 30,
    name: 'Secretária',
    email: 'secretary@email.com',
    roles: [UserRoles.SECRETARY]
  }

  const patientUser: TokenPayload = {
    id: 40,
    name: 'Paciente',
    email: 'patient@email.com',
    roles: [UserRoles.PATIENT]
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mocks.getRepository.mockImplementation((entity: unknown) => {
      if (entity === Patient) {
        return {
          findOne: mocks.patientFindOne
        }
      }

      if (entity === Doctor) {
        return {
          findOne: mocks.doctorFindOne
        }
      }

      throw new Error('Entidade não encontrada no mock')
    })

    const medicalRecordsRepository = {
      hasDoctorPatientLink: mocks.hasDoctorPatientLink,
      create: mocks.create,
      findByPatientId: mocks.findByPatientId
    } as unknown as MedicalRecordsRepository

    medicalRecordsService = new MedicalRecordsService(medicalRecordsRepository)
  })

  describe('create', () => {
    it('deve criar um prontuário com sucesso', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.doctorFindOne.mockResolvedValue(doctor)
      mocks.hasDoctorPatientLink.mockResolvedValue(true)
      mocks.create.mockResolvedValue(medicalRecord)

      const result = await medicalRecordsService.create(
        1,
        'Paciente apresenta melhora clínica',
        doctorUser
      )

      expect(mocks.patientFindOne).toHaveBeenCalledWith({
        where: { id: 1 }
      })

      expect(mocks.doctorFindOne).toHaveBeenCalledWith({
        where: {
          user: {
            id: doctorUser.id
          }
        }
      })

      expect(mocks.hasDoctorPatientLink).toHaveBeenCalledWith(10, 1)

      expect(mocks.create).toHaveBeenCalledWith({
        patientId: 1,
        doctorId: 10,
        text: 'Paciente apresenta melhora clínica'
      })

      expect(result).toEqual({
        id: 100,
        patientId: 1,
        doctorId: 10,
        text: 'Paciente apresenta melhora clínica',
        createdAt: '2026-01-01T10:00:00.000Z'
      })
    })

    it('deve negar acesso quando o usuário não for médico', async () => {
      await expect(
        medicalRecordsService.create(1, 'Texto do prontuário', patientUser)
      ).rejects.toMatchObject({
        message: 'Apenas médicos podem escrever no prontuário',
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.patientFindOne).not.toHaveBeenCalled()
      expect(mocks.create).not.toHaveBeenCalled()
    })

    it('deve negar acesso para administradores', async () => {
      await expect(
        medicalRecordsService.create(1, 'Texto do prontuário', {
          ...adminUser,
          roles: [UserRoles.ADMIN, UserRoles.DOCTOR]
        })
      ).rejects.toMatchObject({
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.patientFindOne).not.toHaveBeenCalled()
    })

    it('deve negar acesso para secretários', async () => {
      await expect(
        medicalRecordsService.create(1, 'Texto do prontuário', {
          ...secretaryUser,
          roles: [UserRoles.SECRETARY, UserRoles.DOCTOR]
        })
      ).rejects.toMatchObject({
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.patientFindOne).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o paciente não existir', async () => {
      mocks.patientFindOne.mockResolvedValue(null)

      await expect(
        medicalRecordsService.create(999, 'Texto do prontuário', doctorUser)
      ).rejects.toMatchObject({
        message: 'Paciente não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.doctorFindOne).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o médico não existir', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.doctorFindOne.mockResolvedValue(null)

      await expect(
        medicalRecordsService.create(1, 'Texto do prontuário', doctorUser)
      ).rejects.toMatchObject({
        message: 'Médico não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.hasDoctorPatientLink).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando o médico não possuir vínculo com o paciente', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.doctorFindOne.mockResolvedValue(doctor)
      mocks.hasDoctorPatientLink.mockResolvedValue(false)

      await expect(
        medicalRecordsService.create(1, 'Texto do prontuário', doctorUser)
      ).rejects.toMatchObject({
        message: 'Você não possui vínculo com este paciente',
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.create).not.toHaveBeenCalled()
    })
  })

  describe('findByPatientId', () => {
    it('deve listar prontuários de um paciente para um médico com vínculo', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.doctorFindOne.mockResolvedValue(doctor)
      mocks.hasDoctorPatientLink.mockResolvedValue(true)
      mocks.findByPatientId.mockResolvedValue([medicalRecord])

      const result = await medicalRecordsService.findByPatientId(1, doctorUser)

      expect(mocks.patientFindOne).toHaveBeenCalledWith({
        where: { id: 1 }
      })

      expect(mocks.doctorFindOne).toHaveBeenCalledWith({
        where: {
          user: {
            id: doctorUser.id
          }
        }
      })

      expect(mocks.hasDoctorPatientLink).toHaveBeenCalledWith(10, 1)

      expect(mocks.findByPatientId).toHaveBeenCalledWith(1)

      expect(result).toEqual({
        data: [
          {
            id: 100,
            patientId: 1,
            doctorId: 10,
            text: 'Paciente apresenta melhora clínica',
            createdAt: '2026-01-01T10:00:00.000Z'
          }
        ],
        meta: {
          total: 1,
          page: 1,
          pageSize: 1,
          totalPages: 1
        }
      })
    })

    it('deve permitir que administradores consultem prontuários sem vínculo', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.findByPatientId.mockResolvedValue([medicalRecord])

      const result = await medicalRecordsService.findByPatientId(1, adminUser)

      expect(mocks.findByPatientId).toHaveBeenCalledWith(1)

      expect(mocks.doctorFindOne).not.toHaveBeenCalled()
      expect(mocks.hasDoctorPatientLink).not.toHaveBeenCalled()

      expect(result.meta.total).toBe(1)
    })

    it('deve retornar lista vazia quando não houver prontuários', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.doctorFindOne.mockResolvedValue(doctor)
      mocks.hasDoctorPatientLink.mockResolvedValue(true)
      mocks.findByPatientId.mockResolvedValue([])

      const result = await medicalRecordsService.findByPatientId(1, doctorUser)

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 0,
          totalPages: 0
        }
      })
    })

    it('deve negar acesso para secretários', async () => {
      await expect(
        medicalRecordsService.findByPatientId(1, secretaryUser)
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para acessar este prontuário',
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.patientFindOne).not.toHaveBeenCalled()
    })

    it('deve negar acesso para usuários sem permissão', async () => {
      await expect(
        medicalRecordsService.findByPatientId(1, patientUser)
      ).rejects.toMatchObject({
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.patientFindOne).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o paciente não existir', async () => {
      mocks.patientFindOne.mockResolvedValue(null)

      await expect(
        medicalRecordsService.findByPatientId(999, doctorUser)
      ).rejects.toMatchObject({
        message: 'Paciente não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.doctorFindOne).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o médico não existir', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.doctorFindOne.mockResolvedValue(null)

      await expect(
        medicalRecordsService.findByPatientId(1, doctorUser)
      ).rejects.toMatchObject({
        message: 'Médico não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.hasDoctorPatientLink).not.toHaveBeenCalled()
    })

    it('deve negar acesso quando o médico não possuir vínculo com o paciente', async () => {
      mocks.patientFindOne.mockResolvedValue(patient)
      mocks.doctorFindOne.mockResolvedValue(doctor)
      mocks.hasDoctorPatientLink.mockResolvedValue(false)

      await expect(
        medicalRecordsService.findByPatientId(1, doctorUser)
      ).rejects.toMatchObject({
        message: 'Você não possui vínculo com este paciente',
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.findByPatientId).not.toHaveBeenCalled()
    })
  })
})
