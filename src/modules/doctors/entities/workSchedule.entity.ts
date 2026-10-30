import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { Doctor } from '../../doctors/entities/doctor.entity.js'

export interface WorkScheduleShift {
  weekDay: number
  startTime: string
  endTime: string
  slotDurationMinutes: number
}

@Entity('work_schedules')
export class WorkSchedule {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'doctor_id', type: 'integer', unique: true })
  doctorId!: number

  @Column({ type: 'jsonb', default: [] })
  shifts!: WorkScheduleShift[]

  @OneToOne(() => Doctor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor
}
