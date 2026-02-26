import assert from "node:assert";
import { describe, it } from "node:test";
import { postAuthorSchema } from "./zod.js"; 

describe("Validation Schemas", () => {
  describe("postAuthorSchema", () => {
    it("should validate a correct author object", () => {
      const author = { email: "test@example.org", name: "test" };
      const result = postAuthorSchema.safeParse(author);
      assert.strictEqual(result.success, true);
    });

    it("should fail if email is not a valid email string", () => {
      const author = { email: "not-an-email", name: "test" };
      const result = postAuthorSchema.safeParse(author);
      assert.strictEqual(result.success, false);
    });

    it("should fail if name is empty", () => {
      const author = { email: "test@example.org", name: "" };
      const result = postAuthorSchema.safeParse(author);
      assert.strictEqual(result.success, false);
    });

    it("should fail if name is too long (more than 32)", () => {
      const author = { email: "test@example.org", name: "test".repeat(9) };
      const result = postAuthorSchema.safeParse(author);
      assert.strictEqual(result.success, false);
    });
  });
});
