export class Validator {
  static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
  }

  static isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim() !== ''
  }

  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)
  }

  static isValidPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    )
  }

  static isValidCPF(cpf: string): boolean {
    const digits = cpf.replace(/\D/g, '')

    if (!/^\d{11}$/.test(digits)) {
      return false
    }

    if (/^(\d)\1{10}$/.test(digits)) {
      return false
    }

    const calculateDigit = (length: number): number => {
      let sum = 0

      for (let i = 0; i < length; i++) {
        sum += Number(digits[i]) * (length + 1 - i)
      }

      const remainder = (sum * 10) % 11
      return remainder === 10 ? 0 : remainder
    }

    const firstDigit = calculateDigit(9)
    const secondDigit = calculateDigit(10)

    return (
      firstDigit === Number(digits[9]) && secondDigit === Number(digits[10])
    )
  }
}
