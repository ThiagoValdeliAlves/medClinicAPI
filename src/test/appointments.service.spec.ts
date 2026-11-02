import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ERROR_CODE } from '../@commons/errors/domain.error.js'
import type { TokenPayload } from '../@commons/utils/interfaces/tokenService.js'
import type { AppointmentsRepository } from '../modules/appointments/appointments.repository.js'
import { AppointmentService } from '../modules/appointments/appointments.service.js'
import { APPOINTMENT_STATUS } from '../modules/appointments/entities/enums/AppointmentsStatus.js'
import { Doctor } from '../modules/doctors/entities/doctor.entity.js'
import { UserRoles } from '../modules/users/entities/enums/userRole.js'

const mocks = vi.hoisted(() => ({
  getRepository: vi.fn(),
  doctorFindOne: vi.fn(),
  createAppointment: vi.fn(),
  find: vi.fn(),
  findById: vi.fn(),
  updateStatus: vi.fn()
}))

vi.mock('../@commons/database/dataSource.js', () => ({
  AppDataSource: {
    getRepository: mocks.getRepository
  }
}))

describe('AppointmentService', () => {
  let appointmentService: AppointmentService

  const doctor = {
    id: 10
  }

  const appointment = {
    id: 100,
    doctorId: 10,
    patientId: 20,
    date: new Date('2026-01-02T10:00:00.000Z'),
    duration: 30,
    status: APPOINTMENT_STATUS.SCHEDULED
  }

  const adminUser: TokenPayload = {
    id: 1,
    name: 'Admin',
    email: 'admin@email.com',
    roles: [UserRoles.ADMIN]
  }

  const doctorUser: TokenPayload = {
    id: 2,
    name: 'Dr. Thiago',
    email: 'doctor@email.com',
    roles: [UserRoles.DOCTOR]
  }

  const secretaryUser: TokenPayload = {
    id: 3,
    name: 'Secretária',
    email: 'secretary@email.com',
    roles: [UserRoles.SECRETARY]
  }

  const patientUser: TokenPayload = {
    id: 4,
    name: 'Paciente',
    email: 'patient@email.com',
    roles: [UserRoles.PATIENT]
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mocks.getRepository.mockImplementation((entity: unknown) => {
      if (entity === Doctor) {
        return {
          findOne: mocks.doctorFindOne
        }
      }

      throw new Error('Entidade não encontrada no mock')
    })

    const appointmentRepository = {
      createAppointment: mocks.createAppointment,
      find: mocks.find,
      findById: mocks.findById,
      updateStatus: mocks.updateStatus
    } as unknown as AppointmentsRepository

    appointmentService = new AppointmentService(appointmentRepository)
  })

  describe('create', () => {
    it('deve criar um agendamento com sucesso', async () => {
      mocks.createAppointment.mockResolvedValue(appointment)

      const input = {
        doctorId: 10,
        patientId: 20,
        startsAt: new Date('2026-01-02T10:00:00.000Z')
      }

      const result = await appointmentService.create(input)

      expect(mocks.createAppointment).toHaveBeenCalledWith(input)

      expect(result).toEqual({
        id: 100,
        doctorId: 10,
        patientId: 20,
        startsAt: '2026-01-02T10:00:00.000Z',
        endsAt: '2026-01-02T10:30:00.000Z',
        status: APPOINTMENT_STATUS.SCHEDULED
      })
    })
  })

  describe('find', () => {
    it('deve listar agendamentos com sucesso para administrador', async () => {
      mocks.find.mockResolvedValue({
        appointments: [appointment],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      })

      const filters = {
        page: 1,
        pageSize: 20
      }

      const result = await appointmentService.find(filters, adminUser)

      expect(mocks.find).toHaveBeenCalledWith(filters)

      expect(result).toEqual({
        data: [
          {
            id: 100,
            doctorId: 10,
            patientId: 20,
            startsAt: '2026-01-02T10:00:00.000Z',
            endsAt: '2026-01-02T10:30:00.000Z',
            status: APPOINTMENT_STATUS.SCHEDULED
          }
        ],
        meta: {
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1
        }
      })

      expect(mocks.doctorFindOne).not.toHaveBeenCalled()
    })

    it('deve filtrar agendamentos pelo médico autenticado', async () => {
      mocks.doctorFindOne.mockResolvedValue(doctor)

      mocks.find.mockResolvedValue({
        appointments: [appointment],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1
      })

      const filters = {
        doctorId: 999,
        patientId: 20
      }

      await appointmentService.find(filters, doctorUser)

      expect(mocks.doctorFindOne).toHaveBeenCalledWith({
        where: {
          user: {
            id: doctorUser.id
          }
        }
      })

      expect(mocks.find).toHaveBeenCalledWith({
        ...filters,
        doctorId: doctor.id
      })
    })

    it('deve lançar erro quando o médico autenticado não existir', async () => {
      mocks.doctorFindOne.mockResolvedValue(null)

      await expect(
        appointmentService.find({}, doctorUser)
      ).rejects.toMatchObject({
        message: 'Médico não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.find).not.toHaveBeenCalled()
    })

    it('deve permitir que administrador consulte agendamentos de qualquer médico', async () => {
      mocks.find.mockResolvedValue({
        appointments: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      })

      await appointmentService.find({ doctorId: 999 }, adminUser)

      expect(mocks.find).toHaveBeenCalledWith({
        doctorId: 999
      })

      expect(mocks.doctorFindOne).not.toHaveBeenCalled()
    })

    it('deve listar agendamentos sem restringir usuários que não sejam médicos', async () => {
      mocks.find.mockResolvedValue({
        appointments: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      })

      await appointmentService.find({}, patientUser)

      expect(mocks.find).toHaveBeenCalledWith({})
      expect(mocks.doctorFindOne).not.toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('deve encontrar um agendamento pelo ID', async () => {
      mocks.findById.mockResolvedValue(appointment)

      const result = await appointmentService.findById(100, adminUser)

      expect(mocks.findById).toHaveBeenCalledWith(100)

      expect(result).toEqual({
        id: 100,
        doctorId: 10,
        patientId: 20,
        startsAt: '2026-01-02T10:00:00.000Z',
        endsAt: '2026-01-02T10:30:00.000Z',
        status: APPOINTMENT_STATUS.SCHEDULED
      })
    })

    it('deve lançar erro quando o agendamento não existir', async () => {
      mocks.findById.mockResolvedValue(null)

      await expect(
        appointmentService.findById(999, adminUser)
      ).rejects.toMatchObject({
        message: 'Agendamento não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })
    })

    it('deve permitir acesso ao médico responsável pelo agendamento', async () => {
      mocks.findById.mockResolvedValue(appointment)
      mocks.doctorFindOne.mockResolvedValue(doctor)

      const result = await appointmentService.findById(100, doctorUser)

      expect(result.id).toBe(100)

      expect(mocks.doctorFindOne).toHaveBeenCalledWith({
        where: {
          user: {
            id: doctorUser.id
          }
        }
      })
    })

    it('deve negar acesso ao médico que não é responsável pelo agendamento', async () => {
      mocks.findById.mockResolvedValue(appointment)

      mocks.doctorFindOne.mockResolvedValue({
        id: 999
      })

      await expect(
        appointmentService.findById(100, doctorUser)
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para acessar este agendamento',
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })
    })

    it('deve lançar erro quando o médico autenticado não existir', async () => {
      mocks.findById.mockResolvedValue(appointment)
      mocks.doctorFindOne.mockResolvedValue(null)

      await expect(
        appointmentService.findById(100, doctorUser)
      ).rejects.toMatchObject({
        message: 'Médico não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })
    })

    it('deve permitir que administrador consulte agendamento sem verificar vínculo', async () => {
      mocks.findById.mockResolvedValue(appointment)

      await appointmentService.findById(100, adminUser)

      expect(mocks.doctorFindOne).not.toHaveBeenCalled()
    })
  })

  describe('updateStatus', () => {
    it('deve permitir administrador iniciar um agendamento', async () => {
      const updatedAppointment = {
        ...appointment,
        status: APPOINTMENT_STATUS.IN_PROGRESS
      }

      mocks.findById.mockResolvedValue(appointment)
      mocks.updateStatus.mockResolvedValue(updatedAppointment)

      const result = await appointmentService.updateStatus(
        100,
        APPOINTMENT_STATUS.IN_PROGRESS,
        adminUser
      )

      expect(mocks.updateStatus).toHaveBeenCalledWith(
        100,
        APPOINTMENT_STATUS.IN_PROGRESS
      )

      expect(result.status).toBe(APPOINTMENT_STATUS.IN_PROGRESS)
    })

    it('deve permitir que o médico responsável inicie um agendamento', async () => {
      mocks.findById.mockResolvedValue(appointment)
      mocks.doctorFindOne.mockResolvedValue(doctor)

      const updatedAppointment = {
        ...appointment,
        status: APPOINTMENT_STATUS.IN_PROGRESS
      }

      mocks.updateStatus.mockResolvedValue(updatedAppointment)

      await appointmentService.updateStatus(
        100,
        APPOINTMENT_STATUS.IN_PROGRESS,
        doctorUser
      )

      expect(mocks.updateStatus).toHaveBeenCalledWith(
        100,
        APPOINTMENT_STATUS.IN_PROGRESS
      )
    })

    it('deve permitir que secretário cancele um agendamento agendado', async () => {
      mocks.findById.mockResolvedValue(appointment)

      const updatedAppointment = {
        ...appointment,
        status: APPOINTMENT_STATUS.CANCELLED
      }

      mocks.updateStatus.mockResolvedValue(updatedAppointment)

      const result = await appointmentService.updateStatus(
        100,
        APPOINTMENT_STATUS.CANCELLED,
        secretaryUser
      )

      expect(mocks.updateStatus).toHaveBeenCalledWith(
        100,
        APPOINTMENT_STATUS.CANCELLED
      )

      expect(result.status).toBe(APPOINTMENT_STATUS.CANCELLED)
    })

    it('deve permitir que administrador finalize um agendamento em andamento', async () => {
      const inProgressAppointment = {
        ...appointment,
        status: APPOINTMENT_STATUS.IN_PROGRESS
      }

      const updatedAppointment = {
        ...inProgressAppointment,
        status: APPOINTMENT_STATUS.DONE
      }

      mocks.findById.mockResolvedValue(inProgressAppointment)
      mocks.updateStatus.mockResolvedValue(updatedAppointment)

      await appointmentService.updateStatus(
        100,
        APPOINTMENT_STATUS.DONE,
        adminUser
      )

      expect(mocks.updateStatus).toHaveBeenCalledWith(
        100,
        APPOINTMENT_STATUS.DONE
      )
    })

    it('deve negar transição inválida de status', async () => {
      mocks.findById.mockResolvedValue(appointment)

      await expect(
        appointmentService.updateStatus(100, APPOINTMENT_STATUS.DONE, adminUser)
      ).rejects.toMatchObject({
        message: 'Transição de status inválida',
        code: ERROR_CODE.TRANSICAO_INVALIDA,
        status: 422
      })

      expect(mocks.updateStatus).not.toHaveBeenCalled()
    })

    it('deve negar transição quando o usuário não possuir permissão', async () => {
      mocks.findById.mockResolvedValue(appointment)

      await expect(
        appointmentService.updateStatus(
          100,
          APPOINTMENT_STATUS.IN_PROGRESS,
          secretaryUser
        )
      ).rejects.toMatchObject({
        message: 'Você não tem permissão para realizar esta transição',
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.updateStatus).not.toHaveBeenCalled()
    })

    it('deve negar cancelamento por médico que não é responsável pelo agendamento', async () => {
      mocks.findById.mockResolvedValue(appointment)
      mocks.doctorFindOne.mockResolvedValue({
        id: 999
      })

      await expect(
        appointmentService.updateStatus(
          100,
          APPOINTMENT_STATUS.CANCELLED,
          doctorUser
        )
      ).rejects.toMatchObject({
        code: ERROR_CODE.ACESSO_NEGADO,
        status: 403
      })

      expect(mocks.updateStatus).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o agendamento não existir', async () => {
      mocks.findById.mockResolvedValue(null)

      await expect(
        appointmentService.updateStatus(
          999,
          APPOINTMENT_STATUS.CANCELLED,
          adminUser
        )
      ).rejects.toMatchObject({
        message: 'Agendamento não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.updateStatus).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o repositório não retornar o agendamento atualizado', async () => {
      mocks.findById.mockResolvedValue(appointment)
      mocks.updateStatus.mockResolvedValue(null)

      await expect(
        appointmentService.updateStatus(
          100,
          APPOINTMENT_STATUS.IN_PROGRESS,
          adminUser
        )
      ).rejects.toMatchObject({
        message: 'Agendamento não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })
    })
  })
})
