import type { Request, Response } from 'express'

import type { UserService } from './user.service.js'
import { ConflictError } from '../../@commons/errors/conflict.error.js'
import { Validator } from '../../@commons/validators/validator.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  private validateBodyForAuth(body: unknown) {
    if (!Validator.isObject(body)) {
      return {
        error: 'Body inválido',
        data: null
      }
    }

    if (
      !Validator.isNonEmptyString(body.email) ||
      !Validator.isValidEmail(body.email)
    ) {
      return {
        error: 'Formato de email inválido',
        data: null
      }
    }

    if (
      !Validator.isNonEmptyString(body.password) ||
      !Validator.isValidPassword(body.password)
    ) {
      return {
        error: 'Formato de senha inválido',
        data: null
      }
    }

    return {
      error: null,
      data: {
        email: body.email,
        password: body.password
      }
    }
  }

  async register(req: Request, res: Response) {
    const body: unknown = req.body
    const result = this.validateBodyForAuth(body)
    if (result.error || !result.data) {
      return res.status(400).json({ error: result.error })
    }

    try {
      const user = await this.userService.register(
        result.data.email,
        result.data.password
      )

      return res.status(201).json(user)
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json({ error: error.message })
      }

      console.error(error)
      return res.status(500).json({ error: 'Erro interno' })
    }
  }

  async login(req: Request, res: Response) {
    const body: unknown = req.body
    const result = this.validateBodyForAuth(body)
    if (result.error || !result.data) {
      return res.status(400).json({ error: result.error })
    }

    try {
      const user = await this.userService.login(
        result.data.email,
        result.data.password
      )

      return res.status(200).json(user)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro interno' })
    }
  }
}
