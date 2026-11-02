import { beforeEach, describe, expect, it, vi } from 'vitest'

import { configs } from '../@commons/configs/env.js'
import { ERROR_CODE } from '../@commons/errors/domain.error.js'
import type { PasswordHasher } from '../@commons/utils/interfaces/passwordHasher.js'
import type { TokenService } from '../@commons/utils/interfaces/tokenService.js'
import { UserRoles } from '../modules/users/entities/enums/userRole.js'
import type { User } from '../modules/users/entities/user.entity.js'
import type { UserRepository } from '../modules/users/user.repository.js'
import { UserService } from '../modules/users/user.service.js'

vi.mock('../@commons/configs/env.js', () => ({
  configs: {
    databaseUrl: 'postgresql://test:test@localhost:5432/test',
    jwtSecret: 'test-secret',
    dummyHash: 'dummy-hash'
  }
}))

const mocks = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  register: vi.fn(),
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  generate: vi.fn()
}))

describe('UserService', () => {
  let userService: UserService

  const roles = [UserRoles.ADMIN, UserRoles.DOCTOR]

  const user = {
    id: 1,
    name: 'Thiago',
    email: 'thiago@email.com',
    passwordHash: 'hashed-password',
    roles,
    creationDate: new Date()
  } satisfies User

  beforeEach(() => {
    vi.clearAllMocks()

    const userRepository = {
      findByEmail: mocks.findByEmail,
      register: mocks.register
    } as unknown as UserRepository

    const passwordHasher: PasswordHasher = {
      hashPassword: mocks.hashPassword,
      comparePassword: mocks.comparePassword
    }

    const tokenService: TokenService = {
      generate: mocks.generate,
      verify: vi.fn()
    }

    mocks.generate.mockReturnValue('fake-access-token')

    userService = new UserService(userRepository, passwordHasher, tokenService)
  })

  describe('register', () => {
    it('deve registrar um usuário com sucesso', async () => {
      mocks.findByEmail.mockResolvedValue(null)
      mocks.hashPassword.mockResolvedValue('hashed-password')
      mocks.register.mockResolvedValue(user)

      const result = await userService.register(
        'Thiago',
        'thiago@email.com',
        '123456',
        roles
      )

      expect(mocks.findByEmail).toHaveBeenCalledWith('thiago@email.com')

      expect(mocks.hashPassword).toHaveBeenCalledWith('123456')

      expect(mocks.register).toHaveBeenCalledWith(
        'Thiago',
        'thiago@email.com',
        'hashed-password',
        roles
      )

      expect(mocks.generate).toHaveBeenCalledWith({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      })

      expect(result).toEqual({
        accessToken: 'fake-access-token',
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      })
    })

    it('deve lançar erro quando o e-mail já estiver cadastrado', async () => {
      mocks.findByEmail.mockResolvedValue(user)

      await expect(
        userService.register('Thiago', 'thiago@email.com', '123456', roles)
      ).rejects.toMatchObject({
        message: 'Email já cadastrado',
        code: ERROR_CODE.CONFLITO,
        status: 409
      })

      expect(mocks.hashPassword).not.toHaveBeenCalled()
      expect(mocks.register).not.toHaveBeenCalled()
      expect(mocks.generate).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('deve realizar login com sucesso', async () => {
      mocks.findByEmail.mockResolvedValue(user)
      mocks.comparePassword.mockResolvedValue(true)

      const result = await userService.login('thiago@email.com', '123456')

      expect(mocks.findByEmail).toHaveBeenCalledWith('thiago@email.com')

      expect(mocks.comparePassword).toHaveBeenCalledWith(
        '123456',
        user.passwordHash
      )

      expect(mocks.generate).toHaveBeenCalledWith({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      })

      expect(result).toEqual({
        accessToken: 'fake-access-token',
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      })
    })

    it('deve lançar erro quando o usuário não existir', async () => {
      mocks.findByEmail.mockResolvedValue(null)
      mocks.comparePassword.mockResolvedValue(false)

      await expect(
        userService.login('inexistente@email.com', '123456')
      ).rejects.toMatchObject({
        message: 'Credenciais inválidas',
        code: ERROR_CODE.CREDENCIAIS_INVALIDAS,
        status: 401
      })

      expect(mocks.comparePassword).toHaveBeenCalledWith(
        '123456',
        configs.dummyHash
      )

      expect(mocks.generate).not.toHaveBeenCalled()
    })

    it('deve lançar erro quando a senha estiver incorreta', async () => {
      mocks.findByEmail.mockResolvedValue(user)
      mocks.comparePassword.mockResolvedValue(false)

      await expect(
        userService.login('thiago@email.com', 'senha-errada')
      ).rejects.toMatchObject({
        message: 'Credenciais inválidas',
        code: ERROR_CODE.CREDENCIAIS_INVALIDAS,
        status: 401
      })

      expect(mocks.comparePassword).toHaveBeenCalledWith(
        'senha-errada',
        user.passwordHash
      )

      expect(mocks.generate).not.toHaveBeenCalled()
    })
  })
})
