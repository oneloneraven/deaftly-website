import { expect, test } from "vitest";
import { page } from "./helpers/build.js";

test("the feedback page says it's coming soon and has no form that can't send", async () => {
  const doc = await page("/feedback/");
  expect(doc.querySelector("h1")?.textContent).toContain("Feedback");
  expect(doc.querySelector("main")?.textContent).toMatch(/coming soon/i);
  expect(doc.querySelector("main form")).toBeNull();
});

test("it points to help in the meantime", async () => {
  const doc = await page("/feedback/");
  expect(doc.querySelector('main a[href="/help/"]')).not.toBeNull();
});

test("the footer and help still link to it", async () => {
  expect((await page("/")).querySelector('footer a[href="/feedback/"]')).not.toBeNull();
  expect((await page("/help/")).querySelector('main a[href="/feedback/"]')).not.toBeNull();
});

test("the privacy page doesn't describe collecting feedback that isn't collected yet", async () => {
  const text = (await page("/privacy/")).querySelector("main")?.textContent ?? "";
  expect(text).not.toMatch(/When you use the feedback form, we collect/);
  expect(text).toMatch(/before it opens/i);
});
