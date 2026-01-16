import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardService = async () => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30);

    // Parallel Query (FAST)
    const [
        totalKuesioner,
        kuesionerDraft,
        kuesionerPublish,
        kuesionerArsip,
        totalResponden,
        respondenList,
        responden30Hari
    ] = await Promise.all([
        prisma.kuesioner.count(),

        prisma.kuesioner.count({
            where: { status: "Draft" }
        }),

        prisma.kuesioner.count({
            where: { status: "Publish" }
        }),

        prisma.kuesioner.count({
            where: { status: "Arsip" }
        }),

        prisma.respondenProfile.count(),

        prisma.respondenProfile.groupBy({
            by: ["kuesionerId"],
            _count: { respondenId: true }
        }),

        prisma.respondenProfile.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: today
                }
            },
            select: {
                createdAt: true
            }
        })
    ]);

    // Generate per hari (30 hari)
    const dailyStats = [];
    for (let i = 0; i <= 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const formatted = date.toISOString().split("T")[0];

        const countToday = responden30Hari.filter(r => {
            const d = r.createdAt.toISOString().split("T")[0];
            return d === formatted;
        }).length;

        dailyStats.push({
            date: formatted,
            count: countToday
        });
    }

    dailyStats.reverse();

    // Build response object
    return {
        summary: {
            totalKuesioner,
            draft: kuesionerDraft,
            publish: kuesionerPublish,
            arsip: kuesionerArsip,
            totalResponden
        },

        distribution: respondenList.map(item => ({
            kuesionerId: item.kuesionerId,
            count: item._count.respondenId
        })),

        last30Days: dailyStats
    };
};
