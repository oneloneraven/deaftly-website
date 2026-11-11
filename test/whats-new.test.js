import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { page } from "./helpers/build.js";

const text = (/** @type {Element | null | undefined} */ element) => element?.textContent?.replace(/\s+/g, " ").trim();
const fixture = JSON.parse(readFileSync("test/fixtures/releases.json", "utf8"));

test("releases are listed newest first, each with its date, notes and download", async () => {
  const doc = await page("/whats-new/");
  const entries = [...doc.querySelectorAll("article.release")];
  expect(entries.map(entry => text(entry.querySelector("h2")))).toEqual(["Version 1.4.0", "Version 1.3.0"]);
  expect(text(entries[0].querySelector("time"))).toBe("11 November 2026");
  expect(entries[0].querySelector("time")?.getAttribute("datetime")).toBe("2026-11-11");
  expect([...entries[0].querySelectorAll("li")].map(text)).toEqual(["Add a BSL interpreter built-in template"]);
  expect(entries[1].querySelector("a.release__download")?.getAttribute("href")).toBe(
    fixture[1].assets[0].browser_download_url,
  );
});

test("the newest release is marked as the latest", async () => {
  const doc = await page("/whats-new/");
  expect(text(doc.querySelector("article.release .badge"))).toBe("Latest");
  expect(doc.querySelectorAll("article.release .badge").length).toBe(1);
});
