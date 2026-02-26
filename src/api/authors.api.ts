import { Hono } from "hono";

import { prisma } from "./prisma.js";
import type { Author } from "../generated/prisma/client.js";

export const authorsApi = new Hono();

// type Author = {
//   id: string;
//   name: string;
// };
//
// var authors: Array<Author> = [
//   {
//     id: "1",
//     name: "temp1",
//   },
//   {
//     id: "2",
//     name: "temp2",
//   },
//   {
//     id: "3",
//     name: "temp3",
//   },
//   {
//     id: "4",
//     name: "temp4",
//   },
//   {
//     id: "5",
//     name: "temp5",
//   },
// ];

authorsApi.get("/", async (c) => {
  const authors = await prisma.author.findMany();
  return c.json(authors);
});

authorsApi.post("/", (c) => {
  prisma.author.create({
    data: {
      email: "temp",
      name: "temp",
    },
  });

  return c.json(null, 200);
});

authorsApi.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  try {
    const author = await prisma.author.findUniqueOrThrow({ where: { id: id } });

    return c.json(author, 200);
  } catch (error: any) {
    if (error.code == "P2025") {
      return c.json({ error: `no author with the id ${id} found` }, 404);
    }
    return c.json({ error: "unknown error" }, 409);
  }
});

authorsApi.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  try {
    await prisma.author.delete({ where: { id: id } });

    return c.json(204);
  } catch (error: any) {
    if (error.code == "P2025") {
      return c.json({ error: `no author with the id ${id} found` }, 404);
    }

    return c.json(null, 500);
  }
});
