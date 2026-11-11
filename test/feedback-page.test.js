import { expect, test } from "vitest";
import { page } from "./helpers/build.js";

test("the form posts to the endpoint, labels every field and asks for no contact details", async () => {
  const doc = await page("/feedback/");
  const form = doc.querySelector("main form");
  expect(form?.getAttribute("action")).toBe("/api/feedback");
  expect(form?.getAttribute("method")).toBe("post");
  for (const field of form?.querySelectorAll("input:not([type=hidden]):not([type=radio]), textarea") ?? []) {
    expect(doc.querySelector(`label[for="${field.id}"]`), field.getAttribute("name") ?? "").not.toBeNull();
  }
  expect(form?.querySelectorAll('input[type="radio"][name="kind"]').length).toBe(2);
  expect(form?.querySelector("fieldset legend")).not.toBeNull();
  expect(form?.querySelector('input[type="email"], input[name="email"], input[name="name"]')).toBeNull();
  expect(form?.querySelector("textarea")?.getAttribute("maxlength")).toBe("5000");
  expect(doc.querySelector("main script")).toBeNull();
});

test("the honeypot is hidden from people and skipped by keyboards", async () => {
  const doc = await page("/feedback/");
  const trap = doc.querySelector('input[name="hpx"]');
  expect(trap?.getAttribute("tabindex")).toBe("-1");
  expect(trap?.getAttribute("autocomplete")).toBe("off");
  expect(trap?.closest("[aria-hidden='true']")).not.toBeNull();
});

test("there's a thanks page", async () => {
  const doc = await page("/feedback/thanks/");
  expect(doc.querySelector("h1")?.textContent).toContain("Thank you");
});
