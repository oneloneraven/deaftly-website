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
    "/situations/pharmacy/",
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

test("the situations hub links to every situation page, and every situation page links back", async () => {
  const hub = await page("/situations/");
  const links = [...hub.querySelectorAll("main .situation-grid a")].map(link => link.getAttribute("href"));
  expect([...links].sort()).toEqual(Object.keys(phrases).sort());
  for (const url of Object.keys(phrases)) {
    const doc = await page(url);
    expect(doc.querySelector('main a[href="/situations/"]'), url).not.toBeNull();
  }
});

test("the main menu's Situations link goes to the hub", async () => {
  const doc = await page("/");
  const link = [...doc.querySelectorAll('header nav[aria-label="Main"] a')].find(a => a.textContent === "Situations");
  expect(link?.getAttribute("href")).toBe("/situations/");
});

test("the doctor's page has no interpreter or patronising advice", async () => {
  const text = (await page("/situations/doctors/")).querySelector("main")?.textContent ?? "";
  expect(text).not.toMatch(/interpreter|longer appointment|record that you're deaf|calling your name/i);
  expect(text).toContain("I prefer to communicate by");
  expect(text).not.toMatch(/pharmacy/i);
});
