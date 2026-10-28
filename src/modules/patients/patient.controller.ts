import type { Request, Response } from 'express'

import type { PatientService } from './patient.service.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import { Validator } from '../../@commons/validators/validator.js'

export class PatientController {
  constructor(private readonly patientService: PatientService) {}

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
      !Validator.isNonEmptyString(body.cpf) ||
      !Validator.isValidCPF(body.cpf)
    ) {
      throw new DomainError(
        'Formato de cpf inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    return {
      name: body.name,
      cpf: body.cpf
    }
  }

  async register(req: Request, res: Response) {
    try {
      const data = this.validateBodyForRegister(req.body as unknown)

      const user = await this.patientService.register(data.name, data.cpf)

      return res.status(201).json(user)
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

      const patients = await this.patientService.find(
        page,
        pageSize,
        typeof nameParam === 'string' ? nameParam.trim() : undefined
      )

      return res.status(200).json(patients)
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
          'ID do paciente inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const patient = await this.patientService.findById(id)

      return res.status(200).json(patient)
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

  async updateName(req: Request, res: Response) {
    try {
      const id = Number(req.params.id)

      if (!Number.isInteger(id) || id < 1) {
        throw new DomainError(
          'ID do paciente inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (!Validator.isObject(req.body)) {
        throw new DomainError('Body inválido', ERROR_CODE.DADOS_INVALIDOS)
      }

      if (!Validator.isNonEmptyString(req.body.name)) {
        throw new DomainError(
          'Formato de nome inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const patient = await this.patientService.updateName(
        id,
        req.body.name.trim()
      )

      return res.status(200).json(patient)
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
