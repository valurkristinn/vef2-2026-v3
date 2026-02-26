import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { authorsApi } from "./api/authors.api.js";

const app = new Hono();

import 'dotenv/config'; // Make sure this is the first line

app.get("/", (c) => {
  return c.json({
    "/authors": [
      {
        method: "get",
        description: "returns list of authors",
      },
      {
        method: "post",
        description: "create a new author",
      },
    ],
  });
});

app.route('/authors', authorsApi)

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
