import { PatientController } from './patient.controller.js'
import { PatientsRepository } from './patient.repository.js'
import { PatientService } from './patient.service.js'

const patientRepository = new PatientsRepository()

const patientService = new PatientService(patientRepository)

export const patientController = new PatientController(patientService)
