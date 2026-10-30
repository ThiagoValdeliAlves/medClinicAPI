import type { Request, Response } from 'express'

import type { WorkSchedulesService } from './workSchedule.service.js'
import {
  DomainError,
  ERROR_CODE
} from '../../../@commons/errors/domain.error.js'
import { Validator } from '../../../@commons/validators/validator.js'

export class WorkSchedulesController {
  constructor(private readonly workScheduleService: WorkSchedulesService) {}

  private validateBodyForUpdate(body: unknown) {
    if (!Validator.isObject(body)) {
      throw new DomainError('Body inválido', ERROR_CODE.DADOS_INVALIDOS)
    }

    if (!Array.isArray(body.shifts)) {
      throw new DomainError(
        'Formato de shifts inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    const shifts = body.shifts.map((shift: unknown) => {
      if (!Validator.isObject(shift)) {
        throw new DomainError(
          'Formato de turno inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const { weekDay, startTime, endTime, slotDurationMinutes } = shift

      if (
        !Number.isInteger(weekDay) ||
        (weekDay as number) < 0 ||
        (weekDay as number) > 6
      ) {
        throw new DomainError(
          'Dia da semana inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (
        !Validator.isNonEmptyString(startTime) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)
      ) {
        throw new DomainError(
          'Formato de horário inicial inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (
        !Validator.isNonEmptyString(endTime) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)
      ) {
        throw new DomainError(
          'Formato de horário final inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (startTime >= endTime) {
        throw new DomainError(
          'Horário inicial deve ser menor que o horário final',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (
        !Number.isInteger(slotDurationMinutes) ||
        (slotDurationMinutes as number) <= 0
      ) {
        throw new DomainError(
          'Duração do horário inválida',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      return {
        weekDay: weekDay as number,
        startTime,
        endTime,
        slotDurationMinutes: slotDurationMinutes as number
      }
    })

    for (const [i, current] of shifts.entries()) {
      for (const next of shifts.slice(i + 1)) {
        if (current.weekDay !== next.weekDay) continue

        const overlaps =
          current.startTime < next.endTime && next.startTime < current.endTime

        if (overlaps) {
          throw new DomainError(
            'Existem turnos sobrepostos na escala',
            ERROR_CODE.DADOS_INVALIDOS
          )
        }
      }
    }

    return shifts
  }

  async update(req: Request, res: Response) {
    try {
      const doctorId = Number(req.params.doctorId)
      if (!Number.isInteger(doctorId) || doctorId < 1) {
        throw new DomainError(
          'ID do médico inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const shifts = this.validateBodyForUpdate(req.body as unknown)

      const workSchedule = await this.workScheduleService.update({
        doctorId,
        shifts
      })

      return res.status(200).json(workSchedule)
    } catch (error) {
      if (error instanceof DomainError) {
        return res.status(error.status).json(error.toJSON())
      }

      console.error(error)

      return res.status(500).json({
        statusCode: 500,
        error: 'ERRO_INTERNO',
        message: 'Erro interno'
      })
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.doctorId)
      if (!Number.isInteger(id) || id < 1) {
        throw new DomainError(
          'ID do médico inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const workSchedule = await this.workScheduleService.findById(id)

      return res.status(200).json(workSchedule)
    } catch (error) {
      if (error instanceof DomainError) {
        return res.status(error.status).json(error.toJSON())
      }

      console.error(error)

      return res.status(500).json({
        statusCode: 500,
        error: 'ERRO_INTERNO',
        message: 'Erro interno'
      })
    }
  }
}
