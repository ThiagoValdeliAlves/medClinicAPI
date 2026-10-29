import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm'

import { User } from '../../users/entities/user.entity.js'

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', unique: true, length: 30 })
  crm!: string

  @OneToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
