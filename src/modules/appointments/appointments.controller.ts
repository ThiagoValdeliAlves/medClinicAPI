import type { Request, Response } from 'express'

import type { AppointmentService } from './appointments.service.js'
import { APPOINTMENT_STATUS } from './entities/enums/AppointmentsStatus.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import type { TokenPayload } from '../../@commons/utils/interfaces/tokenService.js'
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

  async find(req: Request, res: Response<unknown, { user: TokenPayload }>) {
    try {
      const doctorIdParam = req.query.doctorId
      const patientIdParam = req.query.patientId
      const statusParam = req.query.status
      const fromParam = req.query.from
      const toParam = req.query.to
      const pageParam = req.query.page
      const pageSizeParam = req.query.pageSize

      const doctorId =
        doctorIdParam === undefined ? undefined : Number(doctorIdParam)

      const patientId =
        patientIdParam === undefined ? undefined : Number(patientIdParam)

      const page = pageParam === undefined ? 1 : Number(pageParam)

      const pageSize = pageSizeParam === undefined ? 20 : Number(pageSizeParam)

      if (
        doctorId !== undefined &&
        (!Number.isInteger(doctorId) || doctorId < 1)
      ) {
        throw new DomainError(
          'ID do médico inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (
        patientId !== undefined &&
        (!Number.isInteger(patientId) || patientId < 1)
      ) {
        throw new DomainError(
          'ID do paciente inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > 100
      ) {
        throw new DomainError(
          'Parâmetros de paginação inválidos',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (
        statusParam !== undefined &&
        (typeof statusParam !== 'string' ||
          !Object.values(APPOINTMENT_STATUS).includes(statusParam))
      ) {
        throw new DomainError('Status inválido', ERROR_CODE.DADOS_INVALIDOS)
      }

      if (
        fromParam !== undefined &&
        (typeof fromParam !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(fromParam) ||
          Number.isNaN(Date.parse(`${fromParam}T00:00:00.000Z`)) ||
          new Date(`${fromParam}T00:00:00.000Z`).toISOString().slice(0, 10) !==
            fromParam)
      ) {
        throw new DomainError(
          'Data inicial inválida',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (
        toParam !== undefined &&
        (typeof toParam !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(toParam) ||
          Number.isNaN(Date.parse(`${toParam}T00:00:00.000Z`)) ||
          new Date(`${toParam}T00:00:00.000Z`).toISOString().slice(0, 10) !==
            toParam)
      ) {
        throw new DomainError('Data final inválida', ERROR_CODE.DADOS_INVALIDOS)
      }

      if (
        typeof fromParam === 'string' &&
        typeof toParam === 'string' &&
        fromParam > toParam
      ) {
        throw new DomainError(
          'Data inicial não pode ser maior que a data final',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const user = res.locals.user

      const appointments = await this.appointmentService.find(
        {
          ...(doctorId !== undefined && { doctorId }),
          ...(patientId !== undefined && { patientId }),
          ...(statusParam !== undefined && {
            status: statusParam
          }),
          ...(typeof fromParam === 'string' && { from: fromParam }),
          ...(typeof toParam === 'string' && { to: toParam }),
          page,
          pageSize
        },
        user
      )

      return res.status(200).json(appointments)
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
