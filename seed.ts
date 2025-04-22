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

  // Örnek bir admin kullanıcısı oluştur
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sportlink.com' },
    update: {},
    create: {
      email: 'admin@sportlink.com',
      username: 'admin',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'secret' şifresi
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      email_verified: true
    }
  });

  console.log(`Admin kullanıcı oluşturuldu: ${adminUser.id}`);

  // Örnek duyurular ekle
  const announcements = await Promise.all([
    prisma.announcement.upsert({
      where: { slug: 'sportlink-platformu-acildi' },
      update: {},
      create: {
        title: 'SportLink Platformu Açıldı!',
        slug: 'sportlink-platformu-acildi',
        content: 'Hoş geldiniz! SportLink, spor tutkunlarını bir araya getiren yeni sosyal platformumuz artık yayında. Etkinlikler oluşturabilir, arkadaşlarınızla spor yapabilir ve yeni insanlarla tanışabilirsiniz.',
        published: true,
        creator_id: adminUser.id,
        start_date: new Date()
      }
    }),
    prisma.announcement.upsert({
      where: { slug: 'uyelik-indirimi-firsati' },
      update: {},
      create: {
        title: 'Üyelik İndirimi Fırsatı',
        slug: 'uyelik-indirimi-firsati',
        content: 'İlk 100 üyemize özel, premium üyelik paketimizde %50 indirim fırsatı! Hemen kaydolun ve avantajlardan yararlanın.',
        published: true,
        creator_id: adminUser.id,
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 30)) // 30 gün sonra
      }
    }),
    prisma.announcement.upsert({
      where: { slug: 'yeni-spor-branslari-eklendi' },
      update: {},
      create: {
        title: 'Yeni Spor Branşları Eklendi',
        slug: 'yeni-spor-branslari-eklendi',
        content: 'Platformumuza basketbol, voleybol ve yüzme branşları eklendi! Artık bu alanlarda da etkinlikler oluşturabilir ve katılabilirsiniz.',
        published: true,
        creator_id: adminUser.id,
        start_date: new Date(new Date().setDate(new Date().getDate() - 5))
      }
    }),
    prisma.announcement.upsert({
      where: { slug: 'etkinlik-olusturma-rehberi' },
      update: {},
      create: {
        title: 'Etkinlik Oluşturma Rehberi',
        slug: 'etkinlik-olusturma-rehberi',
        content: 'SportLink\'te etkinlik oluşturmak çok kolay! Önce spor dalını seçin, ardından tarih, saat ve konum bilgilerini girin. Katılımcı sayısını belirleyin ve etkinliğinizi paylaşın.',
        published: true,
        creator_id: adminUser.id
      }
    }),
    prisma.announcement.upsert({
      where: { slug: 'yaklasan-spor-turnuvasi' },
      update: {},
      create: {
        title: 'Yaklaşan Spor Turnuvası',
        slug: 'yaklasan-spor-turnuvasi',
        content: 'Önümüzdeki ay düzenlenecek olan büyük spor turnuvamıza hazır olun! Basketbol, futbol ve voleybol kategorilerinde yarışmalar olacak. Detaylar yakında...',
        published: false, // Yayınlanmamış
        creator_id: adminUser.id,
        start_date: new Date(new Date().setDate(new Date().getDate() + 15))
      }
    })
  ]);

  console.log(`${announcements.length} duyuru eklendi!`);
  console.log('Duyuru ID\'leri:');
  announcements.forEach(announcement => {
    console.log(`${announcement.title}: ${announcement.id}`);
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