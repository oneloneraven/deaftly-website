import { expect, test } from "vitest";
import { buildSite, page } from "./helpers/build.js";

const htmlPages = async () => [...(await buildSite()).keys()].filter(url => url.endsWith("/"));
const meta = (/** @type {Document} */ doc, /** @type {string} */ selector) =>
  doc.querySelector(selector)?.getAttribute("content");

test("every page has a unique title and description, a canonical URL and share tags", async () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const url of await htmlPages()) {
    const doc = await page(url);
    titles.add(doc.title);
    descriptions.add(meta(doc, 'meta[name="description"]'));
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href"), url).toBe(`https://deaftly.com${url}`);
    expect(meta(doc, 'meta[property="og:title"]'), url).toBeTruthy();
    expect(meta(doc, 'meta[property="og:description"]'), url).toBe(meta(doc, 'meta[name="description"]'));
    expect(meta(doc, 'meta[property="og:url"]'), url).toBe(`https://deaftly.com${url}`);
    expect(meta(doc, 'meta[property="og:image"]'), url).toBe("https://deaftly.com/og/default.png");
    expect(meta(doc, 'meta[name="twitter:card"]'), url).toBe("summary_large_image");
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute("href"), url).toBe("/favicon.png");
  }
  const count = (await htmlPages()).length;
  expect(titles.size).toBe(count);
  expect(descriptions.size).toBe(count);
});

test("the sitemap lists every page, and robots.txt points to it", async () => {
  const site = await buildSite();
  const sitemap = site.get("/sitemap.xml") ?? "";
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const indexed = (await htmlPages()).filter(url => url !== "/feedback/thanks/");
  expect(listed.sort()).toEqual(indexed.map(url => `https://deaftly.com${url}`).sort());
  expect(site.get("/robots.txt")).toContain("Sitemap: https://deaftly.com/sitemap.xml");
});

for (const url of ["/", "/download/"]) {
  test(`${url} describes the app as structured data`, async () => {
    const doc = await page(url);
    const data = JSON.parse(doc.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}");
    expect(data["@type"]).toBe("SoftwareApplication");
    expect(data.operatingSystem).toBe("Android 8.0+");
    expect(data.applicationCategory).toBe("CommunicationApplication");
    expect(data.softwareVersion).toBe("1.4.0");
    expect(data.offers).toBeUndefined();
  });
}
