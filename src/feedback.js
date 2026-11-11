const KINDS = { feedback: "Feedback", bug: "Bug" };
const MAX_MESSAGE = 5000;
const MAX_BODY_BYTES = 20_000;

/**
 * @typedef {{ kind: keyof typeof KINDS, message: string, appVersion: string }} Feedback
 * @typedef {{ kind: string, message: string, appVersion: string }} Draft
 * @typedef {{ FEEDBACK_TOKEN: string, FEEDBACK_REPO: string, FEEDBACK_LIMITER?: { limit: (options: { key: string }) => Promise<{ success: boolean }> } }} FeedbackEnv
 */

const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** @param {string} text */
const escapeHtml = text => text.replace(/[&<>"']/g, char => ENTITIES[/** @type {keyof typeof ENTITIES} */ (char)]);

/**
 * The form again, holding what was typed, so nothing is lost when a send fails.
 * @param {Draft} draft
 */
function form({ kind, message, appVersion }) {
  const checked = (/** @type {string} */ value) =>
    kind === value || (value === "feedback" && kind !== "bug") ? " checked" : "";
  return `<form class="feedback-form" action="/api/feedback" method="post">
<fieldset><legend>What's this about?</legend>
<label class="choice"><input type="radio" name="kind" value="feedback"${checked("feedback")}> Feedback or an idea</label>
<label class="choice"><input type="radio" name="kind" value="bug"${checked("bug")}> Something's not working</label>
</fieldset>
<label for="message">Your message</label>
<textarea id="message" name="message" rows="8" maxlength="5000" required>${escapeHtml(message)}</textarea>
<label for="appVersion">App version (optional)</label>
<input id="appVersion" name="appVersion" type="text" inputmode="decimal" autocomplete="off" value="${escapeHtml(appVersion)}">
<div class="trap" aria-hidden="true"><label for="hpx">Leave this empty</label><input id="hpx" name="hpx" type="text" tabindex="-1" autocomplete="off"></div>
<button class="button" type="submit">Send again</button>
</form>`;
}

/**
 * @param {string} title
 * @param {string} message
 * @param {number} status
 * @param {Draft} [draft]
 */
function page(title, message, status, draft) {
  const body = draft ? form(draft) : '<p><a class="button" href="/feedback/">Back to the form</a></p>';
  const html = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} – Deaftly</title><link rel="stylesheet" href="/styles/site.css"></head>
<body><main id="main" class="wrap section prose"><h1>${title}</h1><p>${message}</p>${body}</main></body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'self'; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
    },
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
 * @param {FormData} data
 * @returns {Draft}
 */
const draftFrom = data => ({
  kind: String(data.get("kind") ?? ""),
  message: String(data.get("message") ?? "")
    .replace(/\r\n/g, "\n")
    .trim(),
  appVersion: String(data.get("appVersion") ?? "").trim(),
});

/**
 * @param {Draft} draft
 * @returns {Feedback | undefined}
 */
function validate({ kind, message, appVersion }) {
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
  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) {
    return page("That's too long", "Please keep your message to 5,000 characters.", 413);
  }
  const limit = await env.FEEDBACK_LIMITER?.limit({ key: request.headers.get("CF-Connecting-IP") ?? "unknown" });

  /** @type {FormData} */
  let data;
  try {
    data = await request.formData();
  } catch {
    return page("Something's missing", "Please fill in the form and try again.", 400);
  }
  const draft = draftFrom(data);
  if (limit && !limit.success) {
    return page(
      "Please wait a moment",
      "You've sent a lot of messages in a short time. Your message is below: try again in a minute.",
      429,
      draft,
    );
  }
  if (String(data.get("hpx") ?? "") !== "") {
    console.log("feedback: honeypot filled, nothing created");
    return thanks();
  }

  const feedback = validate(draft);
  if (!feedback) {
    return page(
      "Something's missing",
      "Please choose feedback or a bug, write a message of up to 5,000 characters, and give the app version as three numbers, like 0.41.1, or leave it blank.",
      400,
      draft,
    );
  }

  const firstLine = feedback.message.split("\n")[0];
  const title = `${KINDS[feedback.kind]}: ${firstLine.length > 70 ? `${firstLine.slice(0, 69)}…` : firstLine}`;
  /** @type {Response | undefined} */
  let response;
  try {
    response = await fetchImpl(`https://api.github.com/repos/${env.FEEDBACK_REPO}/issues`, {
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
  } catch {
    response = undefined;
  }
  if (!response?.ok) {
    return page(
      "Something went wrong",
      "We couldn't send your message just now. It's below, so you can try again.",
      502,
      draft,
    );
  }
  return thanks();
}
