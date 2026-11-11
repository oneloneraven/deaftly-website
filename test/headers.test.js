import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const headers = readFileSync("static/_headers", "utf8");
const csp = headers.match(/Content-Security-Policy: (.+)/)?.[1] ?? "";

test("every path gets a Content-Security-Policy", () => {
  expect(headers.split("\n")[0]).toBe("/*");
  expect(csp).toBeTruthy();
});

test("the policy allows only the site's own origin", () => {
  for (const directive of [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ]) {
    expect(csp).toContain(directive);
  }
  expect(csp).not.toMatch(/https?:|'unsafe-inline'|'unsafe-eval'|\*/);
});
