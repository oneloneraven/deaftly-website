import { expect, test } from "vitest";
import { page } from "./helpers/build.js";

const text = async (/** @type {string} */ url) =>
  ((await page(url)).querySelector("main")?.textContent ?? "").replace(/\s+/g, " ");
const SUPPLIERS = [
  /github/i,
  /microsoft/i,
  /cloudflare/i,
  /google(?! play)/i,
  /anthropic/i,
  /claude/i,
  /proton/i,
  /amazon|aws/i,
];

test("the ethics page covers screening, tracking, accessibility and sustainability", async () => {
  const body = await text("/ethics/");
  for (const phrase of [/BDS/, /screen/i, /no tracking|don't track/i, /WCAG 2\.2/, /deaf people/i, /sustainab/i])
    expect(body).toMatch(phrase);
});

test("the ethics page names no supplier", async () => {
  const body = await text("/ethics/");
  for (const supplier of SUPPLIERS) expect(body).not.toMatch(supplier);
});

test("the privacy page covers the app, Android backup, the site and the feedback form", async () => {
  const body = await text("/privacy/");
  for (const phrase of [
    /on your phone/i,
    /Android backup/i,
    /templates/i,
    /chat/i,
    /camera/i,
    /feedback form/i,
    /cookies/i,
    /analytics/i,
    /how long/i,
  ]) {
    expect(body).toMatch(phrase);
  }
});

test("the privacy page names no supplier and makes no blanket network claim", async () => {
  const body = await text("/privacy/");
  for (const supplier of SUPPLIERS) expect(body).not.toMatch(supplier);
  expect(body).not.toMatch(/no internet|never leaves? your phone/i);
});
