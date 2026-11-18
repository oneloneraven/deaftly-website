# 5. Feedback goes to Engage

## Status

Accepted. Supersedes [ADR-0004](0004-feedback-goes-to-a-private-issue-tracker.md).

## Context

ADR-0004 sent the feedback form through this site's Worker to a private GitHub issue tracker. One Lone Raven now runs Engage, a shared service that receives feedback and issue reports for every product. It handles spam checks, replies, testimonials and retention in one place (oneloneraven/engage#48).

## Decision

- **Where it posts:** the feedback form posts as a plain HTML form straight to Engage, at `https://engage-api.oneloneraven.com/v1/submissions`, with `product=deaftly` and `source=web`. Engage answers with a redirect to `/feedback/thanks/`.
- **Bot check:** a Cloudflare Turnstile check, using Engage's public `engage-intake` site key. Turnstile needs JavaScript, so the feedback page is a deliberate exception to the site's no-JavaScript rule. A `<noscript>` message offers `hello@deaftly.com` instead.
- **CSP:** the feedback page's Content Security Policy replaces the site-wide one, adding only Turnstile (`script-src` and `frame-src https://challenges.cloudflare.com`) and posting to Engage (`form-action`).
- **Clean-up:** this site's own `/api/feedback` endpoint, its rate limiter and the GitHub token are removed.

## Consequences

- **Fewer secrets:** this site holds no feedback data and no secrets for it. Engage's record of processing and threat model cover submissions.
- **JavaScript:** the feedback page needs JavaScript. Everything else on the site still works without it.
- **Rejected submissions:** if Engage rejects a submission (for example a failed bot check), the visitor sees Engage's error response, not a page from this site. The form's own checks (required message, length limits, email and version formats) prevent most of these.
- **Screening:** Cloudflare (Turnstile) is already this site's host. Engage is One Lone Raven's own service.
