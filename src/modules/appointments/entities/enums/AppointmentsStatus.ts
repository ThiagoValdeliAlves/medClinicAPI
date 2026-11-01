export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELLED: 'cancelled'
}

export type APPOINTMENT_STATUS =
  (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS]
