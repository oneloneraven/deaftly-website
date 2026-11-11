import { expect, test } from "vitest";
import { buildSite, page } from "./helpers/build.js";

const text = (/** @type {Element | null} */ element) => element?.textContent?.replace(/\s+/g, " ").trim();

test("every page declares British English and a titled, described head", async () => {
  for (const url of (await buildSite()).keys()) {
    const doc = await page(url);
    expect(doc.documentElement.lang, url).toBe("en-GB");
    expect(doc.title, url).toMatch(/ – Deaftly$|^Deaftly$/);
    expect(doc.querySelector('meta[name="description"]')?.getAttribute("content"), url).toBeTruthy();
    expect(doc.querySelector('meta[name="viewport"]')?.getAttribute("content"), url).toContain("width=device-width");
  }
});

test("a skip link leads to the main landmark", async () => {
  const doc = await page("/");
  const skip = doc.body.querySelector("a");
  expect(skip?.getAttribute("href")).toBe("#main");
  expect(doc.querySelector("main#main")).not.toBeNull();
});

test("the main navigation lists Tour, Situations, Help and Get the app, in order", async () => {
  const doc = await page("/");
  const links = [...doc.querySelectorAll('header nav[aria-label="Main"] a')].map(text);
  expect(links).toEqual(["Tour", "Situations", "Help", "Get the app"]);
});

test("the footer lists every statement page, in order", async () => {
  const doc = await page("/");
  const links = [...doc.querySelectorAll('footer nav[aria-label="Footer"] a')].map(text);
  expect(links).toEqual(["Download", "Tour", "Help", "What's new", "Ethics and sustainability", "Privacy", "Feedback"]);
});

test("pages load fonts and styles from the site itself", async () => {
  const doc = await page("/");
  expect(doc.querySelector('link[rel="stylesheet"]')?.getAttribute("href")).toBe("/styles/site.css");
  const preloads = [...doc.querySelectorAll('link[rel="preload"][as="font"]')].map(link => link.getAttribute("href"));
  expect(preloads).toEqual(["/fonts/atkinson-hyperlegible-next.woff2", "/fonts/bricolage-grotesque.woff2"]);
});

test("no page reaches a third party or publishes an email address", async () => {
  for (const [url, html] of await buildSite()) {
    expect(html, url).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    expect(html, url).not.toMatch(/mailto:/i);
    expect(html, url).not.toMatch(/<script[^>]+src="https?:/);
  }
});
