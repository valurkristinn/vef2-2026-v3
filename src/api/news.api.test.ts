import assert from 'node:assert';
import { describe, it } from 'node:test';
import { postNewsSchema } from './news.api.js';

describe('Validation Schemas', () => {
  describe('postNewsSchema', () => {
    it('should validate correct news data', () => {
      const news = {
        title: "Test news",
        slug: "test-news",
        excerpt: "excerpt test",
        content: "content test",
        authorId: 1,
        published: true
      };
      const result = postNewsSchema.safeParse(news);
      assert.strictEqual(result.success, true);
    });

    it('should fail if title is empty', () => {
      const news = {
        title: "",
        slug: "test-news",
        excerpt: "excerpt test",
        content: "content test",
        authorId: 1
      };
      const result = postNewsSchema.safeParse(news);
      assert.strictEqual(result.success, false);
    });

    it('should fail if slug is empty', () => {
      const news = {
        title: "Test news",
        slug: "",
        excerpt: "excerpt test",
        content: "content test",
        authorId: 1
      };
      const result = postNewsSchema.safeParse(news);
      assert.strictEqual(result.success, false);
    });

    it('should fail if authorId is not an integer', () => {
      const news = {
        title: "Test news",
        slug: "test-news",
        excerpt: "excerpt test",
        content: "content test",
        authorId: "NaN" 
      };
      const result = postNewsSchema.safeParse(news);
      assert.strictEqual(result.success, false);
    });
  });
});
