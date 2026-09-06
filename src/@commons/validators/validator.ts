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
}
