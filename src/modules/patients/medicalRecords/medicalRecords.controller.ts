import type { Request, Response } from 'express'

import type { MedicalRecordsService } from './medicalRecords.service.js'
import {
  DomainError,
  ERROR_CODE
} from '../../../@commons/errors/domain.error.js'
import type { TokenPayload } from '../../../@commons/utils/interfaces/tokenService.js'
import { Validator } from '../../../@commons/validators/validator.js'

export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  async create(req: Request, res: Response<unknown, { user: TokenPayload }>) {
    try {
      const patientId = Number(req.params.patientId)

      if (!Number.isInteger(patientId) || patientId < 1) {
        throw new DomainError(
          'ID do paciente inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      if (!Validator.isObject(req.body)) {
        throw new DomainError('Body inválido', ERROR_CODE.DADOS_INVALIDOS)
      }

      const text = req.body.text

      if (typeof text !== 'string' || !text.trim()) {
        throw new DomainError(
          'Texto do prontuário é obrigatório',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const medicalRecord = await this.medicalRecordsService.create(
        patientId,
        text.trim(),
        res.locals.user
      )

      return res.status(201).json(medicalRecord)
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

  async findByPatientId(
    req: Request,
    res: Response<unknown, { user: TokenPayload }>
  ) {
    try {
      const patientId = Number(req.params.patientId)

      if (!Number.isInteger(patientId) || patientId < 1) {
        throw new DomainError(
          'ID do paciente inválido',
          ERROR_CODE.DADOS_INVALIDOS
        )
      }

      const medicalRecords = await this.medicalRecordsService.findByPatientId(
        patientId,
        res.locals.user
      )

      return res.status(200).json(medicalRecords)
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
