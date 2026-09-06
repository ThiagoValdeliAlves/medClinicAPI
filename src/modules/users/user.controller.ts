import type { Request, Response } from 'express'

import type { UserService } from './user.service.js'
import { Validator } from '../../@commons/validators/validator.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  async register(req: Request, res: Response) {
    const body: unknown = req.body

    if (!Validator.isObject(body)) {
      return res.status(400).json({ error: 'Body inválido' })
    }

    if (
      !Validator.isNonEmptyString(body.email) ||
      !Validator.isValidEmail(body.email)
    ) {
      return res.status(400).json({ error: 'Formato de email inválido' })
    }

    if (
      !Validator.isNonEmptyString(body.password) ||
      !Validator.isValidPassword(body.password)
    ) {
      return res.status(400).json({ error: 'Formato de senha inválido' })
    }

    try {
      const user = await this.userService.register(body.email, body.password)

      return res.status(201).json(user)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro interno' })
    }
  }
}
