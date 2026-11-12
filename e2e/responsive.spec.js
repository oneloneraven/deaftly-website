import { readFileSync } from "node:fs";
import { browser, expect } from "@wdio/globals";

// Every page in the sitemap.
const PAGES = [...readFileSync("dist/sitemap.xml", "utf8").matchAll(/<loc>https:\/\/deaftly\.com([^<]+)<\/loc>/g)].map(
  match => match[1],
);

const overflowing = () =>
  browser.execute(() => {
    const width = document.documentElement.clientWidth;
    return [...document.querySelectorAll("body *")]
      .filter(element => element.getBoundingClientRect().right > width + 1 && !element.closest(".trap, table"))
      .map(
        element =>
          `${element.tagName.toLowerCase()}.${element.className} (${Math.round(element.getBoundingClientRect().right)}px > ${width}px)`,
      )
      .slice(0, 5);
  });

describe("small screens and large text (Chrome and Firefox; Safari can't set the viewport)", () => {
  before(async function () {
    if (!browser.isBidi) this.skip();
    await browser.setViewport({ width: 320, height: 640 });
  });

  for (const path of PAGES) {
    it(`${path} doesn't scroll sideways at 320px with text at 200%`, async () => {
      await browser.url(path);
      await browser.execute(() => {
        document.documentElement.style.fontSize = "200%";
      });
      expect(await overflowing()).toEqual([]);
    });
  }

  it("stacks the Show and Chat panels on a phone", async () => {
    await browser.url("/");
    const [show, chat] = await browser.execute(() =>
      [...document.querySelectorAll(".hero-panel")].map(panel => {
        const box = panel.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom };
      }),
    );
    expect(chat.top).toBeGreaterThanOrEqual(show.bottom);
  });
});
