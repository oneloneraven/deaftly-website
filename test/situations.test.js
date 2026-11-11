import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { page } from "./helpers/build.js";

const FEATURES = ["Type & show", "Templates", "Face to face", "Side by side", "camera"];
const phrases = Object.fromEntries(
  [...readFileSync("docs/seo-keywords.md", "utf8").matchAll(/^\| `(\/situations\/[^`]+)` \| ([^|]+) \|/gm)].map(
    match => [match[1], match[2].trim()],
  ),
);

test("there's a page for every researched situation", () => {
  expect(Object.keys(phrases)).toEqual([
    "/situations/doctors/",
    "/situations/ordering-food/",
    "/situations/travel/",
    "/situations/shops/",
  ]);
});

for (const [url, phrase] of Object.entries(phrases)) {
  test(`${url} targets "${phrase}"`, async () => {
    const doc = await page(url);
    const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    expect(`${doc.title} ${description}`.toLowerCase()).toContain(phrase.toLowerCase());
    expect(doc.querySelectorAll("h1").length).toBe(1);
  });

  test(`${url} names Deaftly's features and leads to the download`, async () => {
    const doc = await page(url);
    const text = doc.querySelector("main")?.textContent ?? "";
    expect(FEATURES.some(feature => text.includes(feature))).toBe(true);
    expect(doc.querySelector('main a[href="/download/"]')).not.toBeNull();
  });
}

test("each situation page has a unique title and description", async () => {
  const docs = await Promise.all(Object.keys(phrases).map(url => page(url)));
  const titles = docs.map(doc => doc.title);
  const descriptions = docs.map(doc => doc.querySelector('meta[name="description"]')?.getAttribute("content"));
  expect(new Set(titles).size).toBe(titles.length);
  expect(new Set(descriptions).size).toBe(descriptions.length);
});
