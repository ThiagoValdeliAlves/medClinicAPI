import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { Patient } from './patient.entity.js'
import { Doctor } from '../../doctors/entities/doctor.entity.js'

@Entity('medical_records')
export class MedicalRecords {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id!: number

  @Column({ name: 'patient_id', type: 'integer' })
  patientId!: number

  @Column({ name: 'doctor_id', type: 'integer' })
  doctorId!: number

  @Column({ type: 'text' })
  text!: string

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'creation_date',
    default: () => 'CURRENT_TIMESTAMP'
  })
  creationDate!: Date

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient

  @ManyToOne(() => Doctor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Doctor
}
