const {PrismaClient} = require('@prisma/client');

const client = new PrismaClient();

async function main() {
  await client.comment.deleteMany();
  await client.post.deleteMany();
}

main().catch(error => {
  console.log(error)
}).finally(async () => {
  await client.$disconnect();
})