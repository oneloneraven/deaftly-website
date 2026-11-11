import { $, browser, expect } from "@wdio/globals";

describe("feedback form", () => {
  it("posts through the Worker and lands on the thanks page", async () => {
    await browser.url("/feedback/");
    await $("#message").setValue("Checking the form reaches the Worker");
    // Filling the honeypot makes the Worker answer as for a real post without creating an issue.
    await browser.execute(() => {
      const trap = /** @type {HTMLInputElement} */ (document.querySelector("#website"));
      trap.value = "e2e";
    });
    await $("button[type=submit]").click();
    await expect(browser).toHaveUrl(expect.stringContaining("/feedback/thanks/"));
    await expect($("h1")).toHaveText("Thank you");
  });

  it("won't send an empty message", async () => {
    await browser.url("/feedback/");
    await $("button[type=submit]").click();
    await expect(browser).toHaveUrl(expect.stringMatching(/\/feedback\/$/));
  });
});
