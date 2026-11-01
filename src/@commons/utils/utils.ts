import { DomainError, ERROR_CODE } from '../errors/domain.error.js'

export function toAbsoluteDayMinutes(timeString: string): number {
  const parts = timeString.split(':')

  if (parts.length !== 2) {
    throw new DomainError('Horário inválido', ERROR_CODE.DADOS_INVALIDOS)
  }

  const hour = Number(parts[0])
  const minute = Number(parts[1])

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new DomainError('Horário inválido', ERROR_CODE.DADOS_INVALIDOS)
  }

  if (hour === 0 && minute === 0) {
    return 1440
  }

  return hour * 60 + minute
}
export function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  })

  const parts = formatter.formatToParts(date)

  const weekday = parts.find((part) => part.type === 'weekday')?.value
  const hour = parts.find((part) => part.type === 'hour')?.value
  const minute = parts.find((part) => part.type === 'minute')?.value

  const weekDays: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  }

  const weekDay = weekday ? weekDays[weekday] : undefined

  if (weekDay === undefined || hour === undefined || minute === undefined) {
    throw new Error('Não foi possível interpretar a data')
  }

  return {
    weekDay,
    hours: Number(hour),
    minutes: Number(minute)
  }
}
