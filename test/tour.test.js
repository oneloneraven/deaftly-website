import { expect, test } from "vitest";
import { page } from "./helpers/build.js";

const text = (/** @type {Element | null | undefined} */ element) => element?.textContent?.replace(/\s+/g, " ").trim();

test("the tour follows the evening out, step by step", async () => {
  const doc = await page("/tour/");
  expect([...doc.querySelectorAll("main section[id]")].map(section => section.id)).toEqual([
    "home-screen",
    "type-and-show",
    "show",
    "face-to-face",
    "templates",
    "camera",
    "side-by-side",
    "settings",
  ]);
});

test("every screenshot has alt text and a size, and every caption is real text", async () => {
  const doc = await page("/tour/");
  const images = [...doc.querySelectorAll("main img")];
  expect(images.length).toBe(8);
  for (const image of images) {
    expect(image.getAttribute("alt")?.length, image.getAttribute("src") ?? "").toBeGreaterThan(20);
    expect(image.getAttribute("width")).toBe("390");
    expect(image.getAttribute("height")).toBe("844");
    expect(image.getAttribute("loading")).toBe("lazy");
  }
  for (const section of doc.querySelectorAll("main section[id]"))
    expect(text(section.querySelector("h2 + p"))?.length).toBeGreaterThan(40);
});

test("home links to tour sections that exist", async () => {
  const home = await page("/");
  const tour = await page("/tour/");
  const anchors = [...home.querySelectorAll('a[href^="/tour/#"]')].map(
    link => link.getAttribute("href")?.split("#")[1],
  );
  for (const anchor of anchors) expect(tour.getElementById(anchor ?? ""), anchor).not.toBeNull();
});

test("the tour uses Me, not Sam, and the waiter asks about allergies", async () => {
  const doc = await page("/tour/");
  const main = doc.querySelector("main");
  expect(main?.textContent).not.toMatch(/\bSam\b/);
  for (const image of main?.querySelectorAll("img") ?? []) expect(image.getAttribute("alt")).not.toMatch(/\bSam\b/);
  expect(text(doc.querySelector("#side-by-side .tour-script"))).toContain("Sure! Do you have any allergies?");
});
