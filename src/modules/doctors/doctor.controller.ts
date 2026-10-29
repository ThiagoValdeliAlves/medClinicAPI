import type { Request, Response } from 'express'

import type { DoctorsService } from './doctor.service.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import { Validator } from '../../@commons/validators/validator.js'

export class DoctorsController {
  constructor(private readonly doctorService: DoctorsService) {}

  private validateBodyForRegister(body: unknown) {
    if (!Validator.isObject(body)) {
      throw new DomainError('Body inválido', ERROR_CODE.DADOS_INVALIDOS)
    }

    if (!Validator.isNonEmptyString(body.name)) {
      throw new DomainError(
        'Formato de nome inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    if (
      !Validator.isNonEmptyString(body.email) ||
      !Validator.isValidEmail(body.email)
    ) {
      throw new DomainError(
        'Formato de email inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    if (
      !Validator.isNonEmptyString(body.password) ||
      !Validator.isValidPassword(body.password)
    ) {
      throw new DomainError(
        'Formato de senha inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    if (
      !Validator.isNonEmptyString(body.crm) ||
      !Validator.isValidCRM(body.crm)
    ) {
      throw new DomainError(
        'Formato de CRM inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    return {
      name: body.name,
      email: body.email,
      password: body.password,
      crm: body.crm
    }
  }

  async register(req: Request, res: Response) {
    try {
      const data = this.validateBodyForRegister(req.body as unknown)

      const doctor = await this.doctorService.register(data)

      return res.status(201).json(doctor)
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

  async find(req: Request, res: Response) {
    try {
      const pageParam = req.query.page
      const pageSizeParam = req.query.pageSize
      const nameParam = req.query.name

      const page = pageParam === undefined ? 1 : Number(pageParam)
      const pageSize = pageSizeParam === undefined ? 10 : Number(pageSizeParam)

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
        nameParam !== undefined &&
        (typeof nameParam !== 'string' || nameParam.trim() === '')
      ) {
        throw new DomainError(
          'Parâmetro name inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const doctors = await this.doctorService.find(
        page,
        pageSize,
        typeof nameParam === 'string' ? nameParam.trim() : undefined
      )

      return res.status(200).json(doctors)
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
      const id = Number(req.params.id)

      if (!Number.isInteger(id) || id < 1) {
        throw new DomainError(
          'ID do médico inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const doctor = await this.doctorService.findById(id)

      return res.status(200).json(doctor)
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
