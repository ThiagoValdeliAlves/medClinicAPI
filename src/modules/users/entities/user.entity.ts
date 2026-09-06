import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

import { UserRoles } from './enums/userRole.js'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS'
  })
  id!: number

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string

  @Column({
    type: 'enum',
    enum: UserRoles,
    enumName: 'user_roles',
    default: UserRoles.USER
  })
  role!: UserRoles

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'creation_date',
    default: () => 'CURRENT_TIMESTAMP'
  })
  creationDate!: Date
}
