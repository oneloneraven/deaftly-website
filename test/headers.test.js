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

test("the policy doesn't upgrade requests, which breaks Safari on a local http server", () => {
  expect(csp).not.toContain("upgrade-insecure-requests");
});

const feedbackBlock = headers.split("\n/feedback/\n")[1] ?? "";
const feedbackCsp = feedbackBlock.match(/Content-Security-Policy: (.+)/)?.[1] ?? "";

test("the feedback page replaces the site policy rather than adding a second one", () => {
  expect(feedbackBlock).toMatch(/^\s*! Content-Security-Policy\n/);
});

test("the feedback page allows only Turnstile and posting to Engage beyond the site's own origin", () => {
  expect(feedbackCsp).toContain("script-src 'self' https://challenges.cloudflare.com");
  expect(feedbackCsp).toContain("frame-src https://challenges.cloudflare.com");
  expect(feedbackCsp).toContain("form-action https://engage-api.oneloneraven.com");
  expect(feedbackCsp).toContain("frame-ancestors 'none'");
  expect(feedbackCsp).not.toMatch(/'unsafe-inline'|'unsafe-eval'|\*/);
});
