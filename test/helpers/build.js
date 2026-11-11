import Eleventy from "@11ty/eleventy";
import { parseHTML } from "linkedom";

/** @type {Promise<Map<string, string>> | undefined} */
let built;

/**
 * Renders every page in memory and maps each URL to its HTML.
 * @returns {Promise<Map<string, string>>}
 */
export function buildSite() {
  built ??= (async () => {
    const eleventy = new Eleventy("views", "dist", { configPath: ".eleventy.js", quietMode: true });
    const pages = /** @type {Array<{ url: string, content: string }>} */ (await eleventy.toJSON());
    return new Map(pages.map(page => [page.url, page.content]));
  })();
  return built;
}

/**
 * @param {string} url
 * @returns {Promise<Document>}
 */
export async function page(url) {
  const html = (await buildSite()).get(url);
  if (html === undefined) throw new Error(`No page at ${url}`);
  return parseHTML(html).document;
}
