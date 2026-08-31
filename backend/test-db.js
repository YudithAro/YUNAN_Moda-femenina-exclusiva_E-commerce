import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
