import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { filterXSS } from "xss";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import { prisma } from "./prisma.js";
import { pagingSchema, postNewsSchema, slugSchema } from "./zod.js";

export const newsApi = new Hono();



newsApi.get("/", zValidator("query", pagingSchema), async (c) => {
  const limit = c.req.valid("query").limit;
  const offset = c.req.valid("query").offset;

  try {
    const news = await prisma.news.findMany({
      take: limit,
      skip: offset,
      orderBy: {id: 'asc'}
    });

    const count = await prisma.news.count();
    const response = {
      data: news,
      paging: {
        limit: limit,
        offset: offset,
        total: count,
      },
    };
    return c.json(response);
  } catch {
    return c.json(null, 500);
  }
});



newsApi.post("/", zValidator("json", postNewsSchema), async (c) => {
  const data = c.req.valid("json");

  try {
    const newNews = await prisma.news.create({
      data: {
        title: filterXSS(data.title),
        slug: filterXSS(data.slug),
        excerpt: filterXSS(data.excerpt),
        content: filterXSS(data.content),
        authorId: data.authorId,
        published: data.published,
      },
    });

    return c.json(newNews, 201);
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return c.json(
          { error: "A news article with this title/slug already exists" },
          400,
        );
      }
      if (error.code === "P2003") {
        return c.json({ error: "Author does not exist" }, 400);
      }
      return c.json({ error: "Invalid data" }, 400);
    }
    return c.json({ error: "Internal Server Error" }, 500);
  }
});



newsApi.get("/:slug", zValidator("param", slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  try {
    const newsItem = await prisma.news.findUniqueOrThrow({
      where: { slug: slug },
    });

    return c.json(newsItem, 200);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return c.json({ error: `No news with the slug ${slug} found` }, 404);
    }
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

newsApi.put(
  "/:slug",
  zValidator("param", slugSchema),
  zValidator("json", postNewsSchema),
  async (c) => {
    const { slug } = c.req.valid("param");
    const data = c.req.valid("json");

    try {
      const updated = await prisma.news.update({
        where: { slug: slug },
        data: {
          title: filterXSS(data.title),
          slug: filterXSS(data.slug),
          excerpt: filterXSS(data.excerpt),
          content: filterXSS(data.content),
          authorId: data.authorId,
          published: data.published,
        },
      });
      return c.json(updated, 200);
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return c.json({ error: "News not found" }, 404);
        }
        return c.json({ error: "Invalid data" }, 400);
      }
      return c.json({ error: "Internal Server Error" }, 500);
    }
  },
);

newsApi.delete("/:slug", zValidator("param", slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;

  try {
    await prisma.news.delete({ where: { slug: slug } });

    return c.body(null, 204);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return c.json({ error: `No news with the slug ${slug} found` }, 404);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});
