import { z } from "zod";

export const pagingSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).max(1000).optional().default(0),
});

export const postAuthorSchema = z.object({
  email: z.email().max(32),
  name: z.string().min(3).max(32),
});

export const idSchema = z.object({
  id: z.coerce.number().int().min(0),
});

export const postNewsSchema = z.object({
  title: z.string().min(1).max(128),
  slug: z.string().min(1).max(128).slugify(),
  excerpt: z.string().min(1).max(256),
  content: z.string().min(1),
  authorId: z.number().int().min(0),
  published: z.boolean().default(false),
});

export const slugSchema = z.object({
  slug: z.string().min(1),
});
