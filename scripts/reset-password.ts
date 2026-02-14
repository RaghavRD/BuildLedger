import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'raghavdesai774@gmail.com'
    const newPassword = 'Admin@123'

    console.log(`Resetting password for ${email}...`)

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        })
        console.log('Password successfully reset for user:', user.email)
        console.log('New Password: Admin@123')
    } catch (error) {
        console.error('Failed to reset password:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
