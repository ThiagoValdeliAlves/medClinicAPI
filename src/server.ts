import { AppDataSource } from './@commons/database/dataSource.js'

async function bootstrap() {
  try {
    console.log('Iniciando banco de dados...')
    await AppDataSource.initialize()
    console.log('Banco de dados iniciado com sucesso!')
  } catch (error) {
    console.error('Erro ao iniciar aplicação:', error)
    process.exit(1)
  }
}

bootstrap().catch(console.error)
