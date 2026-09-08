import { AuthGuard } from './authGuard.js'
import { RoleGuard } from './roleGuard.js'
import { configs } from '../configs/env.js'
import { JwtTokenService } from '../utils/jsonWebToken.js'

const tokenService = new JwtTokenService(configs.jwtSecret)

export const authGuard = new AuthGuard(tokenService)
export const roleGuard = new RoleGuard()
