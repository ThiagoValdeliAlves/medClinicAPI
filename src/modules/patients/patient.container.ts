import { MedicalRecordsController } from './medicalRecords/medicalRecords.controller.js'
import { MedicalRecordsRepository } from './medicalRecords/medicalRecords.repository.js'
import { MedicalRecordsService } from './medicalRecords/medicalRecords.service.js'
import { PatientController } from './patient.controller.js'
import { PatientsRepository } from './patient.repository.js'
import { PatientService } from './patient.service.js'

const patientRepository = new PatientsRepository()
const medicalRecordsRepository = new MedicalRecordsRepository()

const patientService = new PatientService(patientRepository)
const medicalRecordsService = new MedicalRecordsService(
  medicalRecordsRepository
)

export const patientController = new PatientController(patientService)
export const medicalRecordsController = new MedicalRecordsController(
  medicalRecordsService
)
