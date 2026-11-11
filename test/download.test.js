import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { page } from "./helpers/build.js";

const text = (/** @type {Element | null | undefined} */ element) => element?.textContent?.replace(/\s+/g, " ").trim();
const fixture = JSON.parse(readFileSync("test/fixtures/releases.json", "utf8"));

test("three ways to install, with the stores coming soon", async () => {
  const doc = await page("/download/");
  const cards = [...doc.querySelectorAll(".install-card")].map(card => [
    text(card.querySelector("h2")),
    text(card.querySelector(".badge")),
  ]);
  expect(cards).toEqual([
    ["Direct download", "Available now"],
    ["Google Play", "Coming soon"],
    ["iPhone", "Coming soon"],
  ]);
});

test("the download button points at the latest APK and says its version and size", async () => {
  const doc = await page("/download/");
  const button = doc.querySelector("a.download-apk");
  expect(button?.getAttribute("href")).toBe(fixture[0].assets[0].browser_download_url);
  expect(text(button)).toContain("1.4.0");
  expect(text(button)).toContain("15.6 MB");
});

test("it explains why you might install directly, linking the ethics page", async () => {
  const doc = await page("/download/");
  const reasons = doc.querySelectorAll("#why li");
  expect(reasons.length).toBe(4);
  expect(doc.querySelector('#why a[href="/ethics/"]')).not.toBeNull();
});

test("what to expect has four points and says nothing about sync", async () => {
  const doc = await page("/download/");
  expect(doc.querySelectorAll("#expect dt").length).toBe(4);
  expect(text(doc.querySelector("#expect"))).not.toMatch(/sync/i);
});

test("the install steps follow the install guide's five steps", async () => {
  const doc = await page("/download/");
  const steps = [...doc.querySelectorAll("#how ol > li")].map(text);
  expect(steps.length).toBe(5);
  expect(steps[0]).toContain("Download anyway");
  expect(steps[2]).toContain("Allow from this source");
  expect(steps[4]).toContain("switch Allow from this source off");
});

test("the signing fingerprint is there in full, folded away", async () => {
  const doc = await page("/download/");
  expect(text(doc.querySelector("details code"))).toBe(
    "CD:70:A2:F4:8E:E6:1F:8D:90:31:91:CE:BF:D8:D0:D7:2B:D2:57:C9:11:D8:DC:10:0F:A6:FE:AD:F7:6A:53:EB",
  );
});
