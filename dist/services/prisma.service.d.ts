/**
 * Temel Prisma servis sınıfı
 * Tüm model-spesifik servisler bu sınıfı kullanır
 */
export declare class PrismaService {
    protected prismaClient: import(".prisma/client").PrismaClient<{
        log: ("query" | "warn" | "error")[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
/**
 * Singleton kalıbı ile bir Prisma Service örneği döndürür
 */
export declare const getPrismaService: () => PrismaService;
