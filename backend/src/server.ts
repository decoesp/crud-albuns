import app from './app.js'
import { env } from './config/env.js'
import prisma from './config/database.js'

const PORT = env.PORT

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📚 API docs: http://localhost:${PORT}/api/health`)
      console.log(`🌍 Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
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
