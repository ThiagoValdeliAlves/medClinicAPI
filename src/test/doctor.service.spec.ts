import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ERROR_CODE } from '../@commons/errors/domain.error.js'
import type { PasswordHasher } from '../@commons/utils/interfaces/passwordHasher.js'
import type { AppointmentsRepository } from '../modules/appointments/appointments.repository.js'
import type { DoctorsRepository } from '../modules/doctors/doctor.repository.js'
import { DoctorsService } from '../modules/doctors/doctor.service.js'
import type { WorkSchedulesRepository } from '../modules/doctors/workSchedule/workSchedule.repository.js'
import type { UserRepository } from '../modules/users/user.repository.js'

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  findByCRM: vi.fn(),
  hashPassword: vi.fn(),
  register: vi.fn(),
  find: vi.fn(),
  findById: vi.fn(),
  findByDoctorId: vi.fn(),
  findActiveByDoctorAndPeriod: vi.fn()
}))

describe('DoctorsService', () => {
  let doctorsService: DoctorsService

  const user = {
    id: 1,
    name: 'Dr. Thiago',
    email: 'thiago@email.com',
    roles: ['doctor']
  }

  const doctor = {
    id: 10,
    crm: 'CRM12345',
    user
  }

  const workSchedule = {
    shifts: [
      {
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '18:00'
      }
    ]
  }

  const appointment = {
    id: 100,
    patientId: 20,
    date: new Date('2026-01-02T10:00:00.000Z'),
    duration: 30,
    status: 'confirmed'
  }

  beforeEach(() => {
    vi.clearAllMocks()

    const doctorRepository = {
      findByCRM: mocks.findByCRM,
      register: mocks.register,
      find: mocks.find,
      findById: mocks.findById
    } as unknown as DoctorsRepository

    const userRepository = {
      findByEmail: mocks.findByEmail
    } as unknown as UserRepository

    const passwordHasher = {
      hashPassword: mocks.hashPassword
    } as unknown as PasswordHasher

    const workSchedulesRepository = {
      findByDoctorId: mocks.findByDoctorId
    } as unknown as WorkSchedulesRepository

    const appointmentsRepository = {
      findActiveByDoctorAndPeriod: mocks.findActiveByDoctorAndPeriod
    } as unknown as AppointmentsRepository

    doctorsService = new DoctorsService(
      doctorRepository,
      userRepository,
      passwordHasher,
      workSchedulesRepository,
      appointmentsRepository
    )
  })

  describe('register', () => {
    const registerData = {
      name: 'Dr. Thiago',
      email: 'thiago@email.com',
      password: '123456',
      crm: 'CRM12345'
    }

    it('deve registrar um médico com sucesso', async () => {
      mocks.findByEmail.mockResolvedValue(null)
      mocks.findByCRM.mockResolvedValue(null)
      mocks.hashPassword.mockResolvedValue('hashed-password')
      mocks.register.mockResolvedValue(doctor)

      const result = await doctorsService.register(registerData)

      expect(mocks.findByEmail).toHaveBeenCalledWith(registerData.email)

      expect(mocks.findByCRM).toHaveBeenCalledWith(registerData.crm)

      expect(mocks.hashPassword).toHaveBeenCalledWith(registerData.password)

      expect(mocks.register).toHaveBeenCalledWith({
        name: registerData.name,
        email: registerData.email,
        passwordHash: 'hashed-password',
        crm: registerData.crm
      })

      expect(result).toEqual({
        id: doctor.id,
        crm: doctor.crm,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles
        }
      })
    })

    it('deve lançar erro quando o e-mail já estiver cadastrado', async () => {
      mocks.findByEmail.mockResolvedValue(user)

      await expect(doctorsService.register(registerData)).rejects.toMatchObject(
        {
          message: 'E-mail já cadastrado.',
          code: ERROR_CODE.EMAIL_JA_CADASTRADO,
          status: 409
        }
      )

      expect(mocks.findByCRM).not.toHaveBeenCalled()
      expect(mocks.hashPassword).not.toHaveBeenCalled()
      expect(mocks.register).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o CRM já estiver cadastrado', async () => {
      mocks.findByEmail.mockResolvedValue(null)
      mocks.findByCRM.mockResolvedValue(doctor)

      await expect(doctorsService.register(registerData)).rejects.toMatchObject(
        {
          message: 'CRM já cadastrado.',
          code: ERROR_CODE.CRM_JA_CADASTRADO,
          status: 409
        }
      )

      expect(mocks.hashPassword).not.toHaveBeenCalled()
      expect(mocks.register).not.toHaveBeenCalled()
    })
  })

  describe('find', () => {
    it('deve listar médicos com paginação e filtro por nome', async () => {
      const doctors = [
        doctor,
        {
          id: 11,
          crm: 'CRM67890',
          user: {
            id: 2,
            name: 'Dra. Maria',
            email: 'maria@email.com',
            roles: ['doctor']
          }
        }
      ]

      mocks.find.mockResolvedValue([doctors, 25])

      const result = await doctorsService.find(2, 10, 'Thiago')

      expect(mocks.find).toHaveBeenCalledWith(2, 10, 'Thiago')

      expect(result).toEqual({
        data: doctors.map((item) => ({
          id: item.id,
          crm: item.crm,
          user: {
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            roles: item.user.roles
          }
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
      mocks.find.mockResolvedValue([[doctor], 1])

      const result = await doctorsService.find()

      expect(mocks.find).toHaveBeenCalledWith(1, 20, undefined)

      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      })
    })

    it('deve retornar lista vazia quando não houver médicos', async () => {
      mocks.find.mockResolvedValue([[], 0])

      const result = await doctorsService.find()

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
    it('deve encontrar um médico pelo ID', async () => {
      mocks.findById.mockResolvedValue(doctor)

      const result = await doctorsService.findById(10)

      expect(mocks.findById).toHaveBeenCalledWith(10)

      expect(result).toEqual({
        id: doctor.id,
        crm: doctor.crm,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles
        }
      })
    })

    it('deve lançar erro quando o médico não existir', async () => {
      mocks.findById.mockResolvedValue(null)

      await expect(doctorsService.findById(999)).rejects.toMatchObject({
        message: 'Médico não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })
    })
  })

  describe('getCalendar', () => {
    it('deve retornar calendário com escala e agendamentos', async () => {
      mocks.findById.mockResolvedValue(doctor)
      mocks.findByDoctorId.mockResolvedValue(workSchedule)
      mocks.findActiveByDoctorAndPeriod.mockResolvedValue([appointment])

      const result = await doctorsService.getCalendar(
        10,
        '2026-01-01',
        '2026-01-02'
      )

      expect(mocks.findById).toHaveBeenCalledWith(10)

      expect(mocks.findByDoctorId).toHaveBeenCalledWith(10)

      const calls = mocks.findActiveByDoctorAndPeriod.mock.calls

      expect(calls).toHaveLength(1)

      const call = calls.at(0)

      expect(call).toBeDefined()

      if (!call) {
        throw new Error('A chamada do repositório não foi realizada')
      }

      expect(call[0]).toBe(10)

      expect(call[1]).toEqual(new Date('2026-01-01T03:00:00.000Z'))

      expect(call[2]).toEqual(new Date('2026-01-03T03:00:00.000Z'))

      expect(result).toEqual({
        workSchedule: {
          shifts: workSchedule.shifts
        },
        appointments: [
          {
            id: 100,
            patientId: 20,
            startsAt: '2026-01-02T10:00:00.000Z',
            endsAt: '2026-01-02T10:30:00.000Z',
            status: 'confirmed'
          }
        ]
      })
    })

    it('deve retornar calendário sem escala quando ela não existir', async () => {
      mocks.findById.mockResolvedValue(doctor)
      mocks.findByDoctorId.mockResolvedValue(null)
      mocks.findActiveByDoctorAndPeriod.mockResolvedValue([])

      const result = await doctorsService.getCalendar(
        10,
        '2026-01-01',
        '2026-01-02'
      )

      expect(result).toEqual({
        workSchedule: {
          shifts: []
        },
        appointments: []
      })
    })

    it('deve lançar erro quando o médico não existir', async () => {
      mocks.findById.mockResolvedValue(null)

      await expect(
        doctorsService.getCalendar(999, '2026-01-01', '2026-01-02')
      ).rejects.toMatchObject({
        message: 'Médico não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.findByDoctorId).not.toHaveBeenCalled()
      expect(mocks.findActiveByDoctorAndPeriod).not.toHaveBeenCalled()
    })
  })
})
