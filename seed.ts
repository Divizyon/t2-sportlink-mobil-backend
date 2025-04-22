import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Sport tablosuna örnek kayıtlar ekle
  const sports = await Promise.all([
    prisma.sport.upsert({
      where: { name: 'Futbol' },
      update: {},
      create: {
        name: 'Futbol',
        description: 'Takım halinde oynanan, 11 kişilik popüler bir spor',
        icon: 'football-icon',
      },
    }),
    prisma.sport.upsert({
      where: { name: 'Basketbol' },
      update: {},
      create: {
        name: 'Basketbol',
        description: 'Takım halinde oynanan, 5 kişilik popüler bir spor',
        icon: 'basketball-icon',
      },
    }),
    prisma.sport.upsert({
      where: { name: 'Tenis' },
      update: {},
      create: {
        name: 'Tenis',
        description: 'Kort üzerinde 1v1 veya 2v2 oynanan bir raket sporu',
        icon: 'tennis-icon',
      },
    }),
    prisma.sport.upsert({
      where: { name: 'Voleybol' },
      update: {},
      create: {
        name: 'Voleybol',
        description: 'File üzerinden oynanan takım sporu',
        icon: 'volleyball-icon',
      },
    }),
    prisma.sport.upsert({
      where: { name: 'Yüzme' },
      update: {},
      create: {
        name: 'Yüzme',
        description: 'Suda yapılan bireysel veya takım sporu',
        icon: 'swimming-icon',
      },
    }),
  ]);

  console.log(`${sports.length} spor dalı eklendi!`);
  console.log('Sport ID\'leri:');
  sports.forEach(sport => {
    console.log(`${sport.name}: ${sport.id}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 