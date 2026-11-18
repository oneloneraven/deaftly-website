import { expect, test } from "vitest";
import engage from "../views/_data/engage.json" with { type: "json" };
import { buildSite, page } from "./helpers/build.js";

const form = async () => (await page("/feedback/")).querySelector("main form");

test("the form posts to Engage as a plain form for Deaftly from the web", async () => {
  const f = await form();
  expect(f?.getAttribute("action")).toBe("https://engage-api.oneloneraven.com/v1/submissions");
  expect(f?.getAttribute("method")).toBe("post");
  expect(f?.querySelector('input[name="product"]')?.getAttribute("value")).toBe("deaftly");
  expect(f?.querySelector('input[name="source"]')?.getAttribute("value")).toBe("web");
});

test("it sends only the fields Engage accepts", async () => {
  const names = new Set([...((await form())?.querySelectorAll("[name]") ?? [])].map(el => el.getAttribute("name")));
  expect([...names].sort()).toEqual(
    [
      "appVersion",
      "contactEmail",
      "contactName",
      "credit",
      "hpx",
      "kind",
      "message",
      "product",
      "quoteConsent",
      "source",
    ].sort(),
  );
});

test("kind uses Engage's values, and the message limits match Engage's", async () => {
  const f = await form();
  const kinds = [...(f?.querySelectorAll('input[name="kind"]') ?? [])].map(el => el.getAttribute("value"));
  expect(kinds).toEqual(["feedback", "issue"]);
  const message = f?.querySelector("textarea[name=message]");
  expect(message?.hasAttribute("required")).toBe(true);
  expect(message?.getAttribute("maxlength")).toBe("5000");
  expect(f?.querySelector('input[name="appVersion"]')?.getAttribute("pattern")).toBe("\\d+\\.\\d+\\.\\d+");
  const credits = [...(f?.querySelectorAll('input[name="credit"]') ?? [])].map(el => el.getAttribute("value"));
  expect(credits.sort()).toEqual(["anonymous", "initials", "name"]);
});

test("it says plainly that without an email address it can't be answered", async () => {
  expect((await form())?.textContent).toMatch(/Without it, we can't answer you/);
});

test("it has the Turnstile widget with the public site key, and a no-JavaScript fallback", async () => {
  const doc = await page("/feedback/");
  expect(engage.turnstileSiteKey).toMatch(/^0x[0-9A-Za-z_-]+$/);
  expect(doc.querySelector(".cf-turnstile")?.getAttribute("data-sitekey")).toBe(engage.turnstileSiteKey);
  expect(doc.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/"]')).not.toBeNull();
  expect((await buildSite()).get("/feedback/")).toMatch(
    /<noscript>[\s\S]*hello@deaftly\.com[\s\S]*<\/noscript>/,
  );
});

test("the footer and help still link to it", async () => {
  expect((await page("/")).querySelector('footer a[href="/feedback/"]')).not.toBeNull();
  expect((await page("/help/")).querySelector('main a[href="/feedback/"]')).not.toBeNull();
});
