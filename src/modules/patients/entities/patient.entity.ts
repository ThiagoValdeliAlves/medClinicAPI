import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS'
  })
  id!: number

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  cpf!: string

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'creation_date',
    default: () => 'CURRENT_TIMESTAMP'
  })
  creationDate!: Date
}
