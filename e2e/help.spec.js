import { $, browser, expect } from "@wdio/globals";

describe("help search", () => {
  it("finds pages as you type, under the site's CSP", async () => {
    await browser.url("/help/");
    await $("#help-q").setValue("text size");
    await expect($("#help-results")).toHaveText(expect.stringContaining("Side by side"));
  });

  it("runs a search passed in the address", async () => {
    await browser.url("/help/?q=torch");
    await expect($("#help-results")).toHaveText(expect.stringContaining("Reading text with the camera"));
  });
});
