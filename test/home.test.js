import { expect, test } from "vitest";
import { buildSite, page } from "./helpers/build.js";

const text = (/** @type {Element | null | undefined} */ element) => element?.textContent?.replace(/\s+/g, " ").trim();
const BANNED = [/no internet/i, /never leaves? your phone/i, /offline[- ]only/i];

test("one H1 says what Deaftly is for", async () => {
  const doc = await page("/");
  const headings = doc.querySelectorAll("h1");
  expect(headings.length).toBe(1);
  expect(text(headings[0])).toBe("Communicate with hearing people quickly and easily");
});

test("the hero shows all four features side by side, without Show and Chat groups", async () => {
  const doc = await page("/");
  const features = doc.querySelector(".hero-features");
  expect([...(features?.querySelectorAll(":scope > a h2") ?? [])].map(text)).toEqual([
    "Start typing",
    "Templates",
    "Face to face",
    "Side by side",
  ]);
  expect(features?.querySelectorAll("h2").length).toBe(4);
  expect(text(features?.querySelector('a[href="/tour/#templates"]'))).toContain("reading text live with the camera");
  expect(
    [...(features?.querySelectorAll(".feature-tile img") ?? [])].map(img => img.getAttribute("src")?.split("?")[0]),
  ).toEqual([
    "/screenshots/show.webp",
    "/screenshots/fill.webp",
    "/screenshots/face-to-face.webp",
    "/screenshots/side-by-side.webp",
  ]);
});

test("the hero has no download button of its own", async () => {
  const doc = await page("/");
  expect(doc.querySelector('.hero a[href="/download/"]')).toBeNull();
});

test("it answers the notes app question, then invites you to take the tour", async () => {
  const doc = await page("/");
  const section = doc.querySelector("#features");
  expect(text(section?.querySelector("h2"))).toBe("“Can't I just type in my notes app?”");
  expect(text(section?.querySelector(".lede"))).toContain("Deaftly is for the conversation");
  expect(section?.querySelectorAll("article").length).toBe(0);
  expect(text(section?.querySelector('a[href="/tour/"]'))).toBe("Take the tour");
});

test("it links to every situation page", async () => {
  const doc = await page("/");
  const links = [...doc.querySelectorAll("#situations a")].map(link => link.getAttribute("href"));
  expect(links).toEqual([
    "/situations/doctors/",
    "/situations/pharmacy/",
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
