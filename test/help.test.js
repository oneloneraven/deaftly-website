import { expect, test } from "vitest";
import { buildSite, page } from "./helpers/build.js";

const text = (/** @type {Element | null | undefined} */ element) => element?.textContent?.replace(/\s+/g, " ").trim();
const TOPICS = [
  "Quick start",
  "Installing and updating",
  "Templates",
  "Show and Type & show",
  "Face to face",
  "Side by side",
  "Reading text with the camera",
  "Settings",
  "Troubleshooting",
];

test("the help menu lists every topic in order", async () => {
  const doc = await page("/help/");
  expect([...doc.querySelectorAll('nav[aria-label="Help topics"] a')].map(text)).toEqual(TOPICS);
});

test("every help page has one H1 and the same menu, marking where you are", async () => {
  const site = await buildSite();
  const urls = [...site.keys()].filter(url => /^\/help\/[^/]+\/$/.test(url));
  expect(urls.length).toBe(TOPICS.length);
  for (const url of urls) {
    const doc = await page(url);
    expect(doc.querySelectorAll("h1").length, url).toBe(1);
    expect(doc.querySelectorAll('nav[aria-label="Help topics"] a').length, url).toBe(TOPICS.length);
    expect(doc.querySelector('nav[aria-label="Help topics"] a[aria-current="page"]')?.getAttribute("href"), url).toBe(
      url,
    );
  }
});

test("links between help pages point at site URLs", async () => {
  const doc = await page("/help/quick-start/");
  const hrefs = [...doc.querySelectorAll("main article a")].map(link => link.getAttribute("href"));
  expect(hrefs).toContain("/help/templates/");
  expect(hrefs.some(href => href?.endsWith(".md"))).toBe(false);
});

test("the search box has a label and works from a search index", async () => {
  const doc = await page("/help/");
  const input = doc.querySelector("input[type=search]");
  expect(doc.querySelector(`label[for="${input?.id}"]`)).not.toBeNull();
  expect(doc.querySelector('script[src^="/scripts/help-search.js"]')).not.toBeNull();
  const index = JSON.parse((await buildSite()).get("/help/index.json") ?? "[]");
  expect(index.map((/** @type {{ title: string }} */ entry) => entry.title)).toEqual(TOPICS);
});
