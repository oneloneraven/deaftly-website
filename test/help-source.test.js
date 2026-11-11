import { expect, test } from "vitest";
import { fetchHelpFiles, helpPages } from "../lib/help.js";

const md = (/** @type {string} */ front, body = "# Page\n") => `---\n${front}\n---\n\n${body}`;

test("pages are sorted by order and links between them become site URLs", () => {
  const pages = helpPages([
    { name: "b.md", text: md("title: B\norder: 2") },
    {
      name: "a.md",
      text: md("title: A\norder: 1", "# A\n\nSee [B](b.md#top) and [the site](https://deaftly.com/).\n"),
    },
  ]);
  expect(pages.map(page => [page.slug, page.title])).toEqual([
    ["a", "A"],
    ["b", "B"],
  ]);
  expect(pages[0].html).toContain('<a href="/help/b/#top">B</a>');
  expect(pages[0].html).toContain('<a href="https://deaftly.com/">the site</a>');
});

test("raw HTML in a page is escaped, not rendered", () => {
  const [page] = helpPages([{ name: "a.md", text: md("title: A\norder: 1", "<script>alert(1)</script>\n") }]);
  expect(page.html).not.toContain("<script>");
});

test("a page without a title fails the build, naming the file", () => {
  expect(() => helpPages([{ name: "foo.md", text: md("order: 1") }])).toThrow("help/foo.md is missing title");
});

test("a page without an order fails the build", () => {
  expect(() => helpPages([{ name: "foo.md", text: md("title: Foo") }])).toThrow("help/foo.md is missing order");
});

test("a link to a page that doesn't exist fails the build", () => {
  expect(() => helpPages([{ name: "a.md", text: md("title: A\norder: 1", "[B](b.md)\n") }])).toThrow(
    "help/a.md links to missing page b",
  );
});

test("an empty help folder fails the build", () => {
  expect(() => helpPages([])).toThrow("no help pages");
});

test("files are read from the app's help folder at the release tag", async () => {
  /** @type {string[]} */
  const urls = [];
  /** @type {typeof fetch} */
  const fetchImpl = async url => {
    urls.push(String(url));
    if (String(url).includes("/contents/help")) {
      return Response.json([
        { name: "a.md", type: "file", download_url: "https://raw.example/a.md" },
        { name: "notes.txt", type: "file", download_url: "https://raw.example/notes.txt" },
      ]);
    }
    return new Response("text of a");
  };
  expect(await fetchHelpFiles("v1.4.0", fetchImpl)).toEqual([{ name: "a.md", text: "text of a" }]);
  expect(urls).toEqual([
    "https://api.github.com/repos/ravendarque/deaftly/contents/help?ref=v1.4.0",
    "https://raw.example/a.md",
  ]);
});

test("a tag without a help folder fails the build", async () => {
  await expect(fetchHelpFiles("v0.1.0", async () => new Response("{}", { status: 404 }))).rejects.toThrow(
    "v0.1.0 has no help folder (HTTP 404)",
  );
});
