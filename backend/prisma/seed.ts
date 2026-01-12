import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Test@123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword
    }
  })

  const album = await prisma.album.upsert({
    where: { id: 'demo-album-1' },
    update: {},
    create: {
      id: 'demo-album-1',
      title: 'Álbum de Demonstração',
      description: 'Este é um álbum de exemplo para demonstrar as funcionalidades do sistema.',
      userId: user.id
    }
  })

  console.log({ user, album })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
