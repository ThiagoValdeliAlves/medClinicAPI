import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ERROR_CODE } from '../@commons/errors/domain.error.js'
import type { DoctorsRepository } from '../modules/doctors/doctor.repository.js'
import type { WorkScheduleShift } from '../modules/doctors/entities/workSchedule.entity.js'
import type { WorkSchedulesRepository } from '../modules/doctors/workSchedule/workSchedule.repository.js'
import { WorkSchedulesService } from '../modules/doctors/workSchedule/workSchedule.service.js'

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  save: vi.fn(),
  findByDoctorId: vi.fn()
}))

describe('WorkSchedulesService', () => {
  let workSchedulesService: WorkSchedulesService

  const doctor = {
    id: 1,
    crm: 'CRM12345'
  }

  const shifts: WorkScheduleShift[] = [
    {
      weekDay: 1,
      startTime: '08:00',
      endTime: '12:00',
      slotDurationMinutes: 30
    },
    {
      weekDay: 1,
      startTime: '13:00',
      endTime: '18:00',
      slotDurationMinutes: 30
    },
    {
      weekDay: 3,
      startTime: '08:00',
      endTime: '17:00',
      slotDurationMinutes: 30
    }
  ]

  const workSchedule = {
    doctorId: 1,
    shifts
  }

  beforeEach(() => {
    vi.clearAllMocks()

    const workScheduleRepository = {
      save: mocks.save,
      findByDoctorId: mocks.findByDoctorId
    } as unknown as WorkSchedulesRepository

    const doctorRepository = {
      findById: mocks.findById
    } as unknown as DoctorsRepository

    workSchedulesService = new WorkSchedulesService(
      workScheduleRepository,
      doctorRepository
    )
  })

  describe('update', () => {
    it('deve atualizar a escala de trabalho com sucesso', async () => {
      mocks.findById.mockResolvedValue(doctor)
      mocks.save.mockResolvedValue(workSchedule)

      const result = await workSchedulesService.update({
        doctorId: 1,
        shifts
      })

      expect(mocks.findById).toHaveBeenCalledWith(1)

      expect(mocks.save).toHaveBeenCalledWith({
        doctorId: 1,
        shifts
      })

      expect(result).toEqual({
        shifts
      })
    })

    it('deve lançar erro quando o médico não existir', async () => {
      mocks.findById.mockResolvedValue(null)

      await expect(
        workSchedulesService.update({
          doctorId: 999,
          shifts
        })
      ).rejects.toMatchObject({
        message: 'Médico não encontrado.',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.save).not.toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('deve encontrar a escala de trabalho pelo ID do médico', async () => {
      mocks.findById.mockResolvedValue(doctor)
      mocks.findByDoctorId.mockResolvedValue(workSchedule)

      const result = await workSchedulesService.findById(1)

      expect(mocks.findById).toHaveBeenCalledWith(1)

      expect(mocks.findByDoctorId).toHaveBeenCalledWith(doctor.id)

      expect(result).toEqual({
        shifts
      })
    })

    it('deve lançar erro quando o médico não existir', async () => {
      mocks.findById.mockResolvedValue(null)

      await expect(workSchedulesService.findById(999)).rejects.toMatchObject({
        message: 'Médico não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.findByDoctorId).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando o médico não possuir escala cadastrada', async () => {
      mocks.findById.mockResolvedValue(doctor)
      mocks.findByDoctorId.mockResolvedValue(null)

      await expect(workSchedulesService.findById(1)).rejects.toMatchObject({
        message: 'Escala não encontrado',
        code: ERROR_CODE.RECURSO_NAO_ENCONTRADO,
        status: 404
      })

      expect(mocks.findByDoctorId).toHaveBeenCalledWith(doctor.id)
    })
  })
})
