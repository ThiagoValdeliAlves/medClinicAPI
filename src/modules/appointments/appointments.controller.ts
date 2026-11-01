import type { Request, Response } from 'express'

import type { AppointmentService } from './appointments.service.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import { Validator } from '../../@commons/validators/validator.js'

export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  private validateBodyForCreate(body: unknown) {
    if (!Validator.isObject(body)) {
      throw new DomainError('Body inválido', ERROR_CODE.DADOS_INVALIDOS)
    }

    const doctorId = Number(body.doctorId)
    const patientId = Number(body.patientId)

    if (!Number.isInteger(doctorId) || doctorId < 1) {
      throw new DomainError('ID do médico inválido', ERROR_CODE.DADOS_INVALIDOS)
    }

    if (!Number.isInteger(patientId) || patientId < 1) {
      throw new DomainError(
        'ID do paciente inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    if (
      !Validator.isNonEmptyString(body.startsAt) ||
      Number.isNaN(Date.parse(body.startsAt)) ||
      !/(Z|[+-]\d{2}:\d{2})$/i.test(body.startsAt)
    ) {
      throw new DomainError(
        'Formato de data inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    return {
      doctorId,
      patientId,
      startsAt: new Date(body.startsAt)
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = this.validateBodyForCreate(req.body as unknown)

      const appointment = await this.appointmentService.create(data)

      return res.status(201).json(appointment)
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
