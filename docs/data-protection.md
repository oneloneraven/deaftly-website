# Data protection: record of processing

What personal data Deaftly website processes, why, where it goes and how long it's
kept. Keep this current: a change that collects new data or adds a processor
updates it in the same PR.

## Processors

| Processor | What it receives | Purpose | Location |
|---|---|---|---|
| Cloudflare (hosting, Workers) | Visitors' IP addresses and request details; feedback form submissions in transit | Serving the site, protecting it from attacks, running the feedback endpoint | Global edge network |
| GitHub (private issue tracker) | Feedback form submissions: kind, message, optional app version | Triaging feedback and bug reports | United States |

## Processing activities

| Data | Purpose | Lawful basis | Retention | Who can see it |
|---|---|---|---|---|
| IP address and request details | Delivering pages and protecting the site | Legitimate interests | The hosting provider's short-lived security logs only; the project keeps none | Cloudflare |
| Feedback: kind (feedback or bug), message, optional app version | Fixing problems and improving Deaftly | Legitimate interests | Until dealt with, and no more than 12 months | The project's maintainers |

The site sets no cookies and runs no analytics or tracking. The form asks for no name or email address and tells people not to include personal details; a message may still contain them, so it's treated as personal data.

## Gaps to settle

- Feedback older than 12 months must be deleted from the issue tracker. Until that's automated, it's a manual check.

## Security measures

See the [threat model](threat-model.md) and [privacy rules](privacy.md).
