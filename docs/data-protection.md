# Data protection: record of processing

What personal data Deaftly website processes, why, where it goes and how long it's
kept. Keep this current: a change that collects new data or adds a processor
updates it in the same PR.

## Controller

One Lone Raven. Contact: support@deaftly.com, as published on the privacy page.

## Processors

| Processor | What it receives | Purpose | Location |
|---|---|---|---|
| Cloudflare (hosting, Workers) | Visitors' IP addresses and request details; the Turnstile bot check on the feedback page | Serving the site, protecting it from attacks, checking feedback submissions aren't from bots | Global edge network |

## Processing activities

| Data | Purpose | Lawful basis | Retention | Who can see it |
|---|---|---|---|---|
| IP address and request details | Delivering pages and protecting the site | Legitimate interests | The hosting provider's short-lived security logs only; the project keeps none | Cloudflare |

The site sets no cookies and runs no analytics or tracking.

The feedback form posts straight to Engage (ADR-0005), and Email Routing hands mail for `hello@`, `support@` and Engage's signed `reply+…@` addresses to Engage's Worker; anything else sent to deaftly.com is dropped. Engage replies from `hello@deaftly.com` through Cloudflare Email Sending. Engage's own record of processing covers what it stores, for how long and who sees it. Deaftly's product settings use the default 12-month retention.

## Gaps to settle


## Security measures

See the [threat model](threat-model.md) and [privacy rules](privacy.md).
