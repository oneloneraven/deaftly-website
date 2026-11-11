import { expect, test } from "vitest";
import { buildSite, page } from "./helpers/build.js";

const text = (/** @type {Element | null | undefined} */ element) => element?.textContent?.replace(/\s+/g, " ").trim();
const BANNED = [/no internet/i, /never leaves? your phone/i, /offline[- ]only/i, /\bfree\b/i];

test("one H1 says what Deaftly is for", async () => {
  const doc = await page("/");
  const headings = doc.querySelectorAll("h1");
  expect(headings.length).toBe(1);
  expect(text(headings[0])).toBe("Talk with people who can hear, quickly and simply.");
});

test("the hero shows all four features, grouped as Show and Chat", async () => {
  const doc = await page("/");
  const panels = [...doc.querySelectorAll(".hero-panel")];
  expect(panels.map(panel => text(panel.querySelector("h2")))).toEqual(["Show", "Chat"]);
  expect(panels.map(panel => [...panel.querySelectorAll("h3")].map(text))).toEqual([
    ["Start typing", "Templates"],
    ["Face to face", "Side by side"],
  ]);
});

test("it answers the notes app question and covers the camera", async () => {
  const doc = await page("/");
  const headings = [...doc.querySelectorAll("h2")].map(text);
  expect(headings).toContain("“Can't I just type in my notes app?”");
  expect(headings).toContain("Read text with the camera");
});

test("it links to every situation page", async () => {
  const doc = await page("/");
  const links = [...doc.querySelectorAll("#situations a")].map(link => link.getAttribute("href"));
  expect(links).toEqual([
    "/situations/doctors/",
    "/situations/ordering-food/",
    "/situations/travel/",
    "/situations/shops/",
  ]);
});

test("the quote stays hidden until it's approved", async () => {
  const doc = await page("/");
  expect(doc.querySelector("blockquote")).toBeNull();
});

test("no page makes a claim the project can't stand behind", async () => {
  for (const [url, html] of await buildSite()) {
    const body = html.replace(/<head>[\s\S]*?<\/head>/, "");
    for (const phrase of BANNED) expect(body, `${url} ${phrase}`).not.toMatch(phrase);
    expect(body, url).not.toMatch(/\[[A-Z][^\]]*(TBC|TBD)[^\]]*\]/);
  }
});
