import { AppDataSource } from './@commons/database/dataSource.js'
import app from './app.js'

const PORT = Number(process.env.PORT) || 3000

async function bootstrap() {
  try {
    console.log('Iniciando banco de dados...')
    await AppDataSource.initialize()
    console.log('Banco de dados iniciado com sucesso!')

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta: ${String(PORT)}`)
    })
  } catch (error) {
    console.error('Erro ao iniciar aplicação:', error)
    process.exit(1)
  }
}

bootstrap().catch(console.error)
