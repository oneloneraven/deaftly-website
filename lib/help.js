import MarkdownIt from "markdown-it";
import { APP_REPO } from "./github-release.js";

/**
 * @typedef {{ name: string, text: string }} HelpFile
 * @typedef {{ slug: string, title: string, order: number, url: string, html: string, plain: string }} HelpPage
 */

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });

/**
 * Turns the app's help/*.md files into ordered pages, failing on anything a reader would trip over.
 * @param {HelpFile[]} files
 * @returns {HelpPage[]}
 */
export function helpPages(files) {
  if (!files.length) throw new Error("The app has no help pages");
  const slugs = new Set(files.map(file => file.name.replace(/\.md$/, "")));
  /** @type {Map<string, string>} */
  const orders = new Map();
  const pages = files.map(({ name, text: raw }) => {
    const text = raw.replace(/\r\n/g, "\n");
    const front = text.match(/^---\n([\s\S]*?)\n---\n/);
    const title = front?.[1]
      .match(/^title: *(.+)$/m)?.[1]
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
    const order = front?.[1].match(/^order: *(\d+)$/m)?.[1];
    if (!title) throw new Error(`help/${name} is missing title`);
    if (!order) throw new Error(`help/${name} is missing order`);
    if (orders.has(order)) throw new Error(`help/${name} has the same order as help/${orders.get(order)}`);
    orders.set(order, name);
    const body = text.slice(front?.[0].length ?? 0);
    for (const [, target] of body.matchAll(/\]\(([^)#:/]+)\.md(?:#[^)]*)?\)/g)) {
      if (!slugs.has(target)) throw new Error(`help/${name} links to missing page ${target}`);
    }
    const slug = name.replace(/\.md$/, "");
    const html = markdown.render(body.replace(/\]\(([^)#:/]+)\.md(#[^)]*)?\)/g, "](/help/$1/$2)"));
    for (const [, target] of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
      const helpPage = target.match(/^\/help\/([^/#]+)\/(?:#.*)?$/)?.[1];
      const resolves =
        /^https?:\/\//.test(target) ||
        target.startsWith("#") ||
        (helpPage ? slugs.has(helpPage) : /^\/(?!\/)/.test(target) && !target.startsWith("/help/"));
      if (!resolves) throw new Error(`help/${name} has a link the site can't resolve: ${target}`);
    }
    return {
      slug,
      title,
      order: Number(order),
      url: `/help/${slug}/`,
      html,
      plain: body
        .replace(/`[^`]*`/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/[#*_`>[\]()]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    };
  });
  return pages.sort((a, b) => a.order - b.order);
}

/**
 * Reads help/*.md from the app repository at a tag.
 * @param {string} tag
 * @param {typeof fetch} [fetchImpl]
 * @param {{ token?: string }} [options]
 * @returns {Promise<HelpFile[]>}
 */
export async function fetchHelpFiles(tag, fetchImpl = fetch, { token = process.env.GITHUB_TOKEN } = {}) {
  /** @type {Record<string, string>} */
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const listing = await fetchImpl(
    `https://api.github.com/repos/${APP_REPO}/contents/help?ref=${encodeURIComponent(tag)}`,
    { headers },
  );
  if (!listing.ok) throw new Error(`${tag} has no help folder (HTTP ${listing.status})`);
  const entries = /** @type {Array<{ name: string, type: string, download_url: string }>} */ (await listing.json());
  const markdownFiles = entries.filter(entry => entry.type === "file" && entry.name.endsWith(".md"));
  return Promise.all(
    markdownFiles.map(async entry => {
      const response = await fetchImpl(entry.download_url);
      if (!response.ok) throw new Error(`Couldn't read help/${entry.name} at ${tag} (HTTP ${response.status})`);
      return { name: entry.name, text: await response.text() };
    }),
  );
}
