export interface TokenPayload {
  id: number
  email: string
  role: string
}

export interface TokenService {
  generate(payload: TokenPayload): string
  verify(token: string): TokenPayload
}
