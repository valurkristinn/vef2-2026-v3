import { prisma } from "../src/api/prisma.js";
import type { Author } from "../src/generated/prisma/client.js";

async function upsertAuthor(i: number) {
  await prisma.author.upsert({
    where: { email: `author${i}@example.org` },
    update: {},
    create: {
      email: `author${i}@example.org`,
      name: `author${i}`,
    },
  });
} 

async function upsertNews(i: number, authorIds: number[]) {
  const authorId = authorIds[i%authorIds.length];
  await prisma.news.upsert({
    where: { id: i },
    update: {},
    create: {
      title: `News title ${i}`,
      slug: `news-title-${i}`,
      excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin magna quam, lobortis id est ut, volutpat pellentesque sapien. Suspendisse non tincidunt nibh. Maecenas id lobortis arcu.",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer venenatis, neque ut feugiat auctor, risus massa venenatis massa, ac sagittis ipsum magna sagittis libero. Praesent euismod, nisi a facilisis sodales, massa urna consectetur velit, eu maximus arcu quam vel erat. Praesent lacus lorem, tempor in viverra pharetra, malesuada non libero. Vestibulum non lectus dapibus, vehicula justo quis, tristique ante. Nulla ultricies dolor vel dolor viverra dignissim a non mi. Phasellus ut mattis metus. Nulla id mattis mi. Maecenas tempus metus scelerisque metus pretium, eget fringilla felis ornare. Sed laoreet, ipsum eget porttitor volutpat, massa metus bibendum est, vel ornare elit sapien vestibulum enim. Maecenas ornare dui at hendrerit vestibulum. Pellentesque vitae ullamcorper massa, rutrum accumsan dui. ",
      authorId: authorId,
    },
  });
}

async function main() {
  await prisma.news.deleteMany()
  await prisma.author.deleteMany()
  

  for (let i = 0; i < 8; i++) {
    await upsertAuthor(i);
  }

  const authors = await prisma.author.findMany({
    where: {
      email: { contains: "example.org" },
    },
  });

  const authorIds = authors.map((i: Author) => i.id);

  for (let i = 0; i < 24; i++) {
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
