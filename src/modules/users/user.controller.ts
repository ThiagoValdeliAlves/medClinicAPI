import type { Request, Response } from 'express'

import { UserRoles } from './entities/enums/userRole.js'
import type { UserService } from './user.service.js'
import { DomainError, ERROR_CODE } from '../../@commons/errors/domain.error.js'
import type { TokenPayload } from '../../@commons/utils/interfaces/tokenService.js'
import { Validator } from '../../@commons/validators/validator.js'

export class UserController {
  constructor(private readonly userService: UserService) {}

  private validateBodyForAuth(body: unknown) {
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
      !Array.isArray(body.roles) ||
      body.roles.length === 0 ||
      !body.roles.every((role: unknown) =>
        Object.values(UserRoles).includes(role as UserRoles)
      )
    ) {
      throw new DomainError(
        'Formato de roles inválido',
        ERROR_CODE.DADOS_INVALIDOS
      )
    }

    return {
      name: body.name,
      email: body.email,
      password: body.password,
      roles: body.roles as UserRoles[]
    }
  }

  private validateBodyForLogin(body: unknown) {
    if (!Validator.isObject(body)) {
      throw new DomainError('Body inválido', ERROR_CODE.DADOS_INVALIDOS)
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

    return {
      email: body.email,
      password: body.password
    }
  }

  async register(req: Request, res: Response) {
    try {
      const data = this.validateBodyForAuth(req.body as unknown)

      const user = await this.userService.register(
        data.name,
        data.email,
        data.password,
        data.roles
      )

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

  async login(req: Request, res: Response) {
    try {
      const data = this.validateBodyForLogin(req.body as unknown)

      const user = await this.userService.login(data.email, data.password)

      return res.status(200).json(user)
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

  me(req: Request, res: Response<unknown, { user: TokenPayload }>) {
    const data = res.locals.user
    return res.status(200).json({
      id: data.id,
      name: data.name,
      email: data.email,
      roles: data.roles
    })
  }
}
