import { expect, test } from "vitest";
import { handleFeedback, issueBody } from "../src/feedback.js";

/** @param {Record<string, string>} fields */
const post = fields =>
  new Request("https://deaftly.com/api/feedback", { method: "POST", body: new URLSearchParams(fields) });

function harness({ status = 201, allowed = true } = {}) {
  /** @type {Array<{ url: string, init: RequestInit | undefined }>} */
  const calls = [];
  /** @type {typeof fetch} */
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response("{}", { status });
  };
  const env = {
    FEEDBACK_TOKEN: "secret-token",
    FEEDBACK_REPO: "oneloneraven/deaftly-feedback",
    FEEDBACK_LIMITER: { limit: async () => ({ success: allowed }) },
  };
  return { calls, env, fetchImpl };
}

test("a valid message becomes one issue and sends you to the thanks page", async () => {
  const { calls, env, fetchImpl } = harness();
  const response = await handleFeedback(
    post({ kind: "bug", message: "The camera won't freeze", appVersion: "0.41.1", hpx: "" }),
    env,
    fetchImpl,
  );
  expect(response.status).toBe(303);
  expect(response.headers.get("Location")).toBe("/feedback/thanks/");
  expect(calls).toHaveLength(1);
  expect(calls[0].url).toBe("https://api.github.com/repos/oneloneraven/deaftly-feedback/issues");
  expect(new Headers(calls[0].init?.headers).get("Authorization")).toBe("Bearer secret-token");
  const issue = JSON.parse(String(calls[0].init?.body));
  expect(issue.title).toBe("Bug: The camera won't freeze");
  expect(issue.labels).toEqual(["bug"]);
  expect(issue.body).toContain("App version: 0.41.1");
});

test("an empty message is refused", async () => {
  const { calls, env, fetchImpl } = harness();
  const response = await handleFeedback(post({ kind: "feedback", message: "   " }), env, fetchImpl);
  expect(response.status).toBe(400);
  expect(calls).toHaveLength(0);
});

test("a message over 5000 characters is refused", async () => {
  const { calls, env, fetchImpl } = harness();
  expect((await handleFeedback(post({ kind: "feedback", message: "a".repeat(5001) }), env, fetchImpl)).status).toBe(
    400,
  );
  expect((await handleFeedback(post({ kind: "feedback", message: "a".repeat(5000) }), env, fetchImpl)).status).toBe(
    303,
  );
  expect(calls).toHaveLength(1);
});

test("an unknown kind or a malformed app version is refused", async () => {
  const { calls, env, fetchImpl } = harness();
  expect((await handleFeedback(post({ kind: "spam", message: "hi" }), env, fetchImpl)).status).toBe(400);
  expect(
    (await handleFeedback(post({ kind: "bug", message: "hi", appVersion: "latest" }), env, fetchImpl)).status,
  ).toBe(400);
  expect(calls).toHaveLength(0);
});

test("a filled honeypot looks like success but creates nothing", async () => {
  const { calls, env, fetchImpl } = harness();
  const response = await handleFeedback(
    post({ kind: "feedback", message: "Buy now", hpx: "https://spam.example" }),
    env,
    fetchImpl,
  );
  expect(response.status).toBe(303);
  expect(calls).toHaveLength(0);
});

test("too many posts from one address are slowed down", async () => {
  const { calls, env, fetchImpl } = harness({ allowed: false });
  const response = await handleFeedback(post({ kind: "feedback", message: "hello" }), env, fetchImpl);
  expect(response.status).toBe(429);
  expect(calls).toHaveLength(0);
});

test("when the issue tracker fails, you get a plain error page with no details", async () => {
  const { env, fetchImpl } = harness({ status: 500 });
  const response = await handleFeedback(post({ kind: "feedback", message: "hello" }), env, fetchImpl);
  expect(response.status).toBe(502);
  const html = await response.text();
  expect(html).toContain("Something went wrong");
  expect(html).not.toMatch(/secret-token|stack|Error:/);
});

test("error pages never echo what was sent", async () => {
  const { env, fetchImpl } = harness();
  const response = await handleFeedback(
    post({ kind: "<script>alert(1)</script>", message: "<img src=x onerror=alert(1)>" }),
    env,
    fetchImpl,
  );
  expect(response.status).toBe(400);
  expect(await response.text()).not.toMatch(/<script>alert|<img src=x/);
});

test("the issue body fences the message so nothing in it renders or pings anyone", () => {
  const body = issueBody({ kind: "feedback", message: "Hi @someone\n```\n<script>x</script>", appVersion: "" });
  const fence = body.match(/^(`{4,})text$/m)?.[1];
  expect(fence?.length).toBeGreaterThan(3);
  expect(body).toContain(`${fence}text\nHi @someone\n\`\`\`\n<script>x</script>\n${fence}`);
  expect(body).toContain("App version: not given");
});
