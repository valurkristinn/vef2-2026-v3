import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { authorsApi } from "./api/authors.api.js";
import { newsApi } from "./api/news.api.js";


const app = new Hono();


app.get("/", (c) => {
  return c.json({
    "/authors": [
      {
        method: "GET",
        description: "returns paginated list of authors",
      },
      {
        method: "POST",
        description: "create a new author",
      },
    ],
    "/authors/:id": [
      {
        method: "GET",
        description: "returns author by id",
      },
      {
        method: "DELETE",
        description: "deletes author by id",
      },
      {
        method: "PUT",
        description: "updates author by id",
      },
    ],
    "/news": [
      {
        method: "GET",
        description: "returns paginated list of news",
      },
      {
        method: "POST",
        description: "create a new news",
      },
    ],
    "/news/:slug": [
      {
        method: "GET",
        description: "returns news by slug",
      },
      {
        method: "DELETE",
        description: "deletes news by slug",
      },
      {
        method: "PUT",
        description: "updates news by slug",
      },
    ],
  });
});

app.route("/authors", authorsApi);
app.route("/news", newsApi);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
