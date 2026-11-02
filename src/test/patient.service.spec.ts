import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ERROR_CODE } from '../@commons/errors/domain.error.js'
import type { PatientsRepository } from '../modules/patients/patient.repository.js'
import { PatientService } from '../modules/patients/patient.service.js'

const mocks = vi.hoisted(() => ({
  findByCpf: vi.fn(),
  register: vi.fn(),
  find: vi.fn(),
  findById: vi.fn(),
  updateName: vi.fn(),
  deleteById: vi.fn()
}))

describe('PatientService', () => {
  let patientService: PatientService

  const patient = {
    id: 1,
    name: 'Thiago',
    cpf: '12345678900',
    creationDate: new Date('2026-01-01T10:00:00.000Z')
  }

  beforeEach(() => {
    vi.clearAllMocks()

    const patientsRepository = {
      findByCpf: mocks.findByCpf,
      register: mocks.register,
      find: mocks.find,
      findById: mocks.findById,
      updateName: mocks.updateName,
      deleteById: mocks.deleteById
    } as unknown as PatientsRepository

    patientService = new PatientService(patientsRepository)
  })

  describe('register', () => {
    it('deve registrar um paciente com sucesso', async () => {
      mocks.findByCpf.mockResolvedValue(null)
      mocks.register.mockResolvedValue(patient)

      const result = await patientService.register('Thiago', '12345678900')

      expect(mocks.findByCpf).toHaveBeenCalledWith('12345678900')

      expect(mocks.register).toHaveBeenCalledWith('Thiago', '12345678900')

      expect(result).toEqual({
        id: patient.id,
        name: patient.name,
        cpf: patient.cpf,
        createdAt: patient.creationDate
      })
    })

    it('deve lançar erro quando o CPF já estiver cadastrado', async () => {
      mocks.findByCpf.mockResolvedValue(patient)

      await expect(
        patientService.register('Thiago', '12345678900')
      ).rejects.toMatchObject({
        message: 'CPF já cadastrado',
        code: ERROR_CODE.CPF_JA_CADASTRADO,
        status: 409
      })

      expect(mocks.register).not.toHaveBeenCalled()
    })
  })

  describe('find', () => {
    it('deve listar pacientes com paginação e filtro por nome', async () => {
      const patients = [
        patient,
        {
          id: 2,
          name: 'Maria',
          cpf: '98765432100',
          creationDate: new Date('2026-01-02T10:00:00.000Z')
        }
      ]

      mocks.find.mockResolvedValue([patients, 25])

      const result = await patientService.find(2, 10, 'Thiago')

      expect(mocks.find).toHaveBeenCalledWith(2, 10, 'Thiago')

      expect(result).toEqual({
        data: patients.map((item) => ({
          id: item.id,
          name: item.name,
          cpf: item.cpf,
          createdAt: item.creationDate
        })),
        meta: {
          total: 25,
          page: 2,
          pageSize: 10,
          totalPages: 3
        }
      })
    })

    it('deve utilizar valores padrão de paginação', async () => {
      mocks.find.mockResolvedValue([[patient], 1])

      const result = await patientService.find()

      expect(mocks.find).toHaveBeenCalledWith(1, 20, undefined)

      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      })
    })

    it('deve retornar lista vazia quando não houver pacientes', async () => {
      mocks.find.mockResolvedValue([[], 0])

      const result = await patientService.find()

      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0
        }
      })
    })
  })

  describe('findById', () => {
    it('deve encontrar um paciente pelo ID', async () => {
      mocks.findById.mockResolvedValue(patient)

      const result = await patientService.findById(1)

      expect(mocks.findById).toHaveBeenCalledWith(1)

      expect(result).toEqual({
        id: patient.id,
        name: patient.name,
        cpf: patient.cpf,
        createdAt: patient.creationDate
      })
    })

    it('deve lançar erro quando o paciente não existir', async () => {
      mocks.findById.mockResolvedValue(null)

      await expect(patientService.findById(999)).rejects.toMatchObject({
        message: 'Paciente não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })
    })
  })

  describe('updateName', () => {
    it('deve atualizar o nome do paciente', async () => {
      const updatedPatient = {
        ...patient,
        name: 'Thiago Silva'
      }

      mocks.updateName.mockResolvedValue(updatedPatient)

      const result = await patientService.updateName(1, 'Thiago Silva')

      expect(mocks.updateName).toHaveBeenCalledWith(1, 'Thiago Silva')

      expect(result).toEqual(updatedPatient)
    })

    it('deve lançar erro quando o paciente não existir', async () => {
      mocks.updateName.mockResolvedValue(null)

      await expect(
        patientService.updateName(999, 'Thiago Silva')
      ).rejects.toMatchObject({
        message: 'Paciente não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })
    })
  })

  describe('deleteById', () => {
    it('deve excluir um paciente com sucesso', async () => {
      mocks.deleteById.mockResolvedValue(true)

      await expect(patientService.deleteById(1)).resolves.toBeUndefined()

      expect(mocks.deleteById).toHaveBeenCalledWith(1)
    })

    it('deve lançar erro quando o paciente não existir', async () => {
      mocks.deleteById.mockResolvedValue(false)

      await expect(patientService.deleteById(999)).rejects.toMatchObject({
        message: 'Paciente não encontrado',
        code: ERROR_CODE.PACIENTE_INDISPONIVEL,
        status: 409
      })
    })
  })
})
