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
}
