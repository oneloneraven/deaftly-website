import { expect, test } from "vitest";
import { greeting } from "../src/greeting.js";

test("greets by name", () => {
  expect(greeting("Deaftly website")).toBe("Hello from Deaftly website");
});
