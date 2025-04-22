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

  // Haber kayıtları ekle
  const news = await Promise.all([
    // Futbol haberleri
    prisma.news.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000001' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Konya Spor, Transferde Büyük Atak Yapıyor',
        content: 'Konya Spor, yeni sezon öncesinde transfer çalışmalarını hızlandırdı. Kulüp, yıldız oyuncu Ali Yılmaz ile anlaşma sağladı. Bu transfer, takımın ligdeki iddiasını artıracak.',
        source_url: 'https://example.com/konyaspor-transfer-haberi',
        image_url: 'https://example.com/images/konyaspor-transfer.jpg',
        published_date: new Date('2023-07-15'),
        sport_id: sports[0].id, // Futbol ID'si
      },
    }),
    prisma.news.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000002' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        title: 'Konya\'da Futbol Akademisi Açıldı',
        content: 'Konya Büyükşehir Belediyesi, genç yetenekleri futbola kazandırmak için yeni bir akademi açtı. Akademide 7-15 yaş arası çocuklar eğitim alacak ve geleceğin yıldızları yetiştirilecek.',
        source_url: 'https://example.com/konya-futbol-akademisi',
        image_url: 'https://example.com/images/konya-akademi.jpg',
        published_date: new Date('2023-08-05'),
        sport_id: sports[0].id, // Futbol ID'si
      },
    }),

    // Basketbol haberleri
    prisma.news.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000003' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        title: 'Konya Basketbol Takımı Final Four\'da',
        content: 'Konya Basketbol Takımı, bu sezon gösterdiği başarılı performansla Final Four\'a yükselmeyi başardı. Takımın başantrenörü, "Hedefimiz şampiyonluk" açıklamasında bulundu.',
        source_url: 'https://example.com/konya-basketbol-final-four',
        image_url: 'https://example.com/images/konya-basketbol.jpg',
        published_date: new Date('2023-06-20'),
        sport_id: sports[1].id, // Basketbol ID'si
      },
    }),

    // Tenis haberleri
    prisma.news.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000004' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        title: 'Konya\'da Uluslararası Tenis Turnuvası Düzenlenecek',
        content: 'Bu yıl ilk kez Konya\'da düzenlenecek olan uluslararası tenis turnuvası için hazırlıklar tamamlandı. Turnuvaya 15 ülkeden 64 sporcu katılacak ve büyük bir ödül havuzu olacak.',
        source_url: 'https://example.com/konya-tenis-turnuvasi',
        image_url: 'https://example.com/images/konya-tenis.jpg',
        published_date: new Date('2023-09-10'),
        sport_id: sports[2].id, // Tenis ID'si
      },
    }),

    // Voleybol haberleri
    prisma.news.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000005' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000005',
        title: 'Konya Voleybol Takımı Şampiyonluk Peşinde',
        content: 'Geçen sezonu ikinci sırada tamamlayan Konya Voleybol Takımı, bu sezon şampiyonluk hedefiyle yola çıkıyor. Takıma üç yeni transfer yapıldı ve kadro güçlendirildi.',
        source_url: 'https://example.com/konya-voleybol-sampiyonluk',
        image_url: 'https://example.com/images/konya-voleybol.jpg',
        published_date: new Date('2023-10-01'),
        sport_id: sports[3].id, // Voleybol ID'si
      },
    }),

    // Yüzme haberleri
    prisma.news.upsert({
      where: { 
        id: '00000000-0000-0000-0000-000000000006' 
      },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000006',
        title: 'Konya\'lı Genç Yüzücü Milli Takımda',
        content: 'Konya\'da yetişen 17 yaşındaki genç yüzücü Ayşe Demir, gösterdiği performansla milli takıma seçildi. Demir, önümüzdeki ay Avrupa Şampiyonası\'nda ülkemizi temsil edecek.',
        source_url: 'https://example.com/konyali-yuzucu-milli-takim',
        image_url: 'https://example.com/images/konya-yuzme.jpg',
        published_date: new Date('2023-11-15'),
        sport_id: sports[4].id, // Yüzme ID'si
      },
    }),
  ]);

  console.log(`${news.length} haber eklendi!`);
  console.log('Haber ID\'leri:');
  news.forEach(item => {
    console.log(`${item.title}: ${item.id}`);
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