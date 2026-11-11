const KINDS = { feedback: "Feedback", bug: "Bug" };
const MAX_MESSAGE = 5000;

/**
 * @typedef {{ kind: keyof typeof KINDS, message: string, appVersion: string }} Feedback
 * @typedef {{ FEEDBACK_TOKEN: string, FEEDBACK_REPO: string, FEEDBACK_LIMITER?: { limit: (options: { key: string }) => Promise<{ success: boolean }> } }} FeedbackEnv
 */

/**
 * @param {string} title
 * @param {string} message
 * @param {number} status
 */
function page(title, message, status) {
  const html = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} – Deaftly</title><link rel="stylesheet" href="/styles/site.css"></head>
<body><main id="main" class="wrap section"><h1>${title}</h1><p>${message}</p><p><a class="button" href="/feedback/">Back to the form</a></p></main></body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const thanks = () => new Response(null, { status: 303, headers: { Location: "/feedback/thanks/" } });

/**
 * The issue's Markdown body. The message sits in a fence longer than any backtick run in it, so nothing renders and no one is mentioned.
 * @param {Feedback} feedback
 */
export function issueBody({ kind, message, appVersion }) {
  const longestRun = Math.max(0, ...(message.match(/`+/g) ?? []).map(run => run.length));
  const fence = "`".repeat(Math.max(4, longestRun + 1));
  return [
    `Kind: ${KINDS[kind]}`,
    `App version: ${appVersion || "not given"}`,
    "",
    `${fence}text`,
    message,
    fence,
    "",
    "Sent from the deaftly.com feedback form.",
  ].join("\n");
}

/**
 * @param {FormData} form
 * @returns {Feedback | undefined}
 */
function parse(form) {
  const kind = String(form.get("kind") ?? "");
  const message = String(form.get("message") ?? "")
    .replace(/\r\n/g, "\n")
    .trim();
  const appVersion = String(form.get("appVersion") ?? "").trim();
  if (!Object.hasOwn(KINDS, kind)) return undefined;
  if (!message || message.length > MAX_MESSAGE) return undefined;
  if (appVersion && !/^\d+\.\d+\.\d+$/.test(appVersion)) return undefined;
  return { kind: /** @type {keyof typeof KINDS} */ (kind), message, appVersion };
}

/**
 * Handles a POST from the feedback form.
 * @param {Request} request
 * @param {FeedbackEnv} env
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<Response>}
 */
export async function handleFeedback(request, env, fetchImpl = fetch) {
  const limit = await env.FEEDBACK_LIMITER?.limit({ key: request.headers.get("CF-Connecting-IP") ?? "unknown" });
  if (limit && !limit.success)
    return page(
      "Please wait a moment",
      "You've sent a lot of messages in a short time. Please try again in a minute.",
      429,
    );

  /** @type {FormData} */
  let form;
  try {
    form = await request.formData();
  } catch {
    return page("Something's missing", "Please fill in the form and try again.", 400);
  }
  if (String(form.get("website") ?? "") !== "") return thanks();

  const feedback = parse(form);
  if (!feedback) {
    return page(
      "Something's missing",
      "Please choose feedback or a bug, write a message of up to 5,000 characters, and give the app version as three numbers, like 0.41.1, or leave it blank.",
      400,
    );
  }

  const firstLine = feedback.message.split("\n")[0];
  const title = `${KINDS[feedback.kind]}: ${firstLine.length > 70 ? `${firstLine.slice(0, 69)}…` : firstLine}`;
  const response = await fetchImpl(`https://api.github.com/repos/${env.FEEDBACK_REPO}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.FEEDBACK_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "deaftly-website-feedback",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ title, body: issueBody(feedback), labels: [feedback.kind] }),
  });
  if (!response.ok)
    return page("Something went wrong", "We couldn't send your message just now. Please try again later.", 502);
  return thanks();
}
