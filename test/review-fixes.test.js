import { expect, test } from "vitest";
import { fetchLatestRelease } from "../lib/github-release.js";
import { helpPages } from "../lib/help.js";
import { handleFeedback } from "../src/feedback.js";
import { buildSite, page } from "./helpers/build.js";

const md = (/** @type {string} */ body) => `---\ntitle: A\norder: 1\n---\n\n# A\n\n${body}\n`;

test("I2: a help title with & or ' is escaped once, not twice", async () => {
  const doc = await page("/help/show/");
  expect(doc.title).toBe("Show and Type & show – Help – Deaftly");
  expect(doc.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe("Show and Type & show – Help");
});

test("I1: stylesheets, scripts and screenshots carry a content hash, so a year's cache never goes stale", async () => {
  const home = await page("/");
  expect(home.querySelector('link[rel="stylesheet"]')?.getAttribute("href")).toMatch(
    /^\/styles\/site\.css\?v=[0-9a-f]{10}$/,
  );
  const help = await page("/help/");
  expect(help.querySelector("script[src]")?.getAttribute("src")).toMatch(
    /^\/scripts\/help-search\.js\?v=[0-9a-f]{10}$/,
  );
  const tour = await page("/tour/");
  for (const image of tour.querySelectorAll("main img"))
    expect(image.getAttribute("src")).toMatch(/^\/screenshots\/[a-z-]+\.webp\?v=[0-9a-f]{10}$/);
});

test("I4: a help link the site can't resolve fails the build, naming the file", () => {
  expect(() => helpPages([{ name: "a.md", text: md("[bad](./a.md)") }])).toThrow(
    "help/a.md has a link the site can't resolve: ./a.md",
  );
  expect(() => helpPages([{ name: "a.md", text: md("![shot](shot.png)") }])).toThrow(
    "help/a.md has a link the site can't resolve: shot.png",
  );
  expect(() => helpPages([{ name: "a.md", text: md("[up](../x.md)") }])).toThrow("can't resolve: ../x.md");
  expect(
    helpPages([{ name: "a.md", text: md("[site](https://deaftly.com/) [me](a.md#top) [dl](/download/)") }]),
  ).toHaveLength(1);
});

test("I5: the honeypot field has a name browsers won't autofill", async () => {
  const doc = await page("/feedback/");
  const trap = doc.querySelector(".trap input");
  expect(trap?.getAttribute("name")).toBe("hpx");
  expect(doc.querySelector('input[name="website"]')).toBeNull();
});

const post = (/** @type {Record<string, string>} */ fields, headers = {}) =>
  new Request("https://deaftly.com/api/feedback", { method: "POST", body: new URLSearchParams(fields), headers });
const env = { FEEDBACK_TOKEN: "t", FEEDBACK_REPO: "o/r", FEEDBACK_LIMITER: { limit: async () => ({ success: true }) } };

test("I6: a failed send gives the form back with the message kept, escaped", async () => {
  const fetchImpl = async () => new Response("{}", { status: 500 });
  const response = await handleFeedback(
    post({ kind: "bug", message: "It broke <b>badly</b> & more", appVersion: "0.41.1" }),
    env,
    fetchImpl,
  );
  expect(response.status).toBe(502);
  const html = await response.text();
  expect(html).toContain('action="/api/feedback" method="post"');
  expect(html).toContain("It broke &lt;b&gt;badly&lt;/b&gt; &amp; more</textarea>");
  expect(html).toContain('value="0.41.1"');
  expect(html).toMatch(/value="bug" checked/);
  expect(html).not.toContain("<b>badly</b>");
});

test("I6: a network error reaching the tracker gives the friendly 502, not a crash", async () => {
  const fetchImpl = async () => {
    throw new TypeError("network down");
  };
  const response = await handleFeedback(post({ kind: "feedback", message: "hello" }), env, fetchImpl);
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain("network down");
});

test("I6: a refused post keeps what you typed too", async () => {
  const response = await handleFeedback(post({ kind: "feedback", message: "kept text", appVersion: "latest" }), env);
  expect(response.status).toBe(400);
  expect(await response.text()).toContain("kept text</textarea>");
});

test("M8: an oversized body is refused before it's read", async () => {
  const fetchImpl = async () => new Response("{}", { status: 201 });
  const response = await handleFeedback(
    post({ kind: "feedback", message: "hi" }, { "Content-Length": "50000" }),
    env,
    fetchImpl,
  );
  expect(response.status).toBe(413);
});

test("M1: the thanks page isn't indexed or in the sitemap", async () => {
  const thanks = await page("/feedback/thanks/");
  expect(thanks.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex");
  expect((await buildSite()).get("/sitemap.xml")).not.toContain("/feedback/thanks/");
});

test("M2: help search stays hidden until its script runs", async () => {
  const doc = await page("/help/");
  expect(doc.querySelector(".help-search")?.hasAttribute("hidden")).toBe(true);
});

test("M4: the latest release is the most recently published, whatever order the API returns", async () => {
  const release = (/** @type {string} */ v, /** @type {string} */ at) => ({
    tag_name: `v${v}`,
    draft: false,
    prerelease: false,
    published_at: at,
    body: "",
    assets: [{ name: `deaftly-${v}.apk`, size: 1, browser_download_url: `https://x/${v}.apk` }],
  });
  const fetchImpl = async () =>
    Response.json([release("1.3.0", "2026-11-01T00:00:00Z"), release("1.4.0", "2026-11-11T00:00:00Z")]);
  expect((await fetchLatestRelease(fetchImpl)).version).toBe("1.4.0");
});

test("M10/M11/I7: copy makes no claims the project can't back", async () => {
  const text = async (/** @type {string} */ url) => (await page(url)).querySelector("main")?.textContent ?? "";
  expect(await text("/download/")).not.toMatch(/Chrome/);
  expect(await text("/feedback/thanks/")).not.toMatch(/read everything/i);
  expect(await text("/privacy/")).not.toMatch(/ask us to correct or delete it, through the feedback form/i);
});
