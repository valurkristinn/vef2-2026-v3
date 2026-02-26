import { prisma } from "../src/api/prisma.js";
async function upsertAuthor(i) {
    await prisma.author.upsert({
        where: { email: `author${i}@example.org` },
        update: {},
        create: {
            email: `author${i}@example.org`,
            name: `author${i}`,
        },
    });
}
async function upsertNews(i, authorIds) {
    const authorId = authorIds[Math.floor(i / 3)];
    await prisma.news.upsert({
        where: { id: i },
        update: {},
        create: {
            title: `News title${i}`,
            slug: `news-title-${i}`,
            excerpt: `excerpt of news${i}`,
            content: `content of news${i}`,
            authorId: authorId,
        },
    });
}
async function main() {
    for (let i = 0; i < 4; i++) {
        await upsertAuthor(i);
    }
    const authors = await prisma.author.findMany({
        where: {
            email: { contains: "example.org" },
        },
    });
    const authorIds = authors.map((i) => i.id);
    for (let i = 0; i < 12; i++) {
        await upsertNews(i, authorIds);
    }
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
