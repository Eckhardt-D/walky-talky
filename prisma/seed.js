const { Users } = require('../server/src/controllers/users');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await new Users().seed({
    usernames: [
      "Mark Reynold",
      "Suzi Quatro",
      "Tim Augustus",
      "Phoebe Schiff",
      "Grant Gerhard",
      "Rosie Green",
      "Carol Butters",
    ]
  });

  console.log('Seeding database successful...')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })