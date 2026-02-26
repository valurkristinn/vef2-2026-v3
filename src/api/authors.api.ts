import { Hono } from "hono";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { filterXSS } from "xss";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

import { prisma } from "./prisma.js";

export const authorsApi = new Hono();

const pagingSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).max(100).optional().default(0),
});

authorsApi.get("/", zValidator("query", pagingSchema), async (c) => {
  const limit = c.req.valid("query").limit;
  const offset = c.req.valid("query").offset;

  try {
    const authors = await prisma.author.findMany({ take: limit, skip: offset });

    const count = await prisma.author.count();
    const response = {
      data: authors,
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

export const postAuthorSchema = z.object({
  email: z.email().max(32),
  name: z.string().min(3).max(32),
});

authorsApi.post("/", zValidator("json", postAuthorSchema), async (c) => {
  const data = c.req.valid("json");

  try {
    const newAuthor = await prisma.author.create({
      data: {
        email: filterXSS(data.email),
        name: filterXSS(data.name),
      },
    });

    return c.json(newAuthor, 201);
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return c.json({ error: "This email is already registered" }, 400);
      }
      return c.json({ error: "Invalid data" }, 400);
    }
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

const idSchema = z.object({
  id: z.coerce.number().int().min(0),
});

authorsApi.get("/:id", zValidator("param", idSchema), async (c) => {
  const id = c.req.valid("param").id;
  try {
    const author = await prisma.author.findUniqueOrThrow({ where: { id: id } });

    return c.json(author, 200);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return c.json({ error: `No author with the id ${id} found` }, 404);
    }
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

authorsApi.put(
  "/:id",
  zValidator("param", idSchema),
  zValidator("json", postAuthorSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    try {
      const updated = await prisma.author.update({
        where: { id },
        data: {
          name: filterXSS(data.name),
          email: filterXSS(data.email),
        },
      });
      return c.json(updated, 200);
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return c.json({ error: "Author not found" }, 404);
        }
        return c.json({ error: "Invalid data" }, 400);
      }
      return c.json({ error: "Internal Server Error" }, 500);
    }
  },
);

authorsApi.delete("/:id", zValidator("param", idSchema), async (c) => {
  const id = c.req.valid("param").id;

  try {
    await prisma.news.deleteMany({ where: { authorId: id } });
    await prisma.author.delete({ where: { id: id } });

    return c.body(null, 204);
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return c.json({ error: `No author with the id ${id} found` }, 404);
    }

    return c.json({ error: "Internal Server Error" }, 500);
  }
});
