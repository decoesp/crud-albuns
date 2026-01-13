import app from './app.js'
import { logger } from './utils/logger.js'
import { env } from './config/env.js'
import prisma from './config/database.js'

const PORT = env.PORT

async function main() {
  try {
    await prisma.$connect()
    logger.info('Database connected', 'Server')

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`, 'Server')
      logger.info(`Environment: ${env.NODE_ENV}`, 'Server')
    })
  } catch (error) {
    logger.error('Failed to start server', 'Server', { error: String(error) })
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

main()
