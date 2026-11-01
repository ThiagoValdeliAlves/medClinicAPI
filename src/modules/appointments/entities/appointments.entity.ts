import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

import { APPOINTMENT_STATUS } from './enums/AppointmentsStatus.js'

@Entity('appointments')
export class Appointments {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id!: number

  @Column({ name: 'patient_id', type: 'integer' })
  patientId!: number

  @Column({ name: 'doctor_id', type: 'integer' })
  doctorId!: number

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'creation_date',
    default: () => 'CURRENT_TIMESTAMP'
  })
  date!: Date

  @Column('integer')
  duration!: number

  @Column({
    type: 'enum',
    enum: APPOINTMENT_STATUS
  })
  status!: APPOINTMENT_STATUS
}
