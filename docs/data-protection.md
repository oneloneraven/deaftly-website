# Data protection: record of processing

What personal data Deaftly website processes, why, where it goes and how long it's
kept. Keep this current: a change that collects new data or adds a processor
updates it in the same PR.

## Processors

| Processor | What it receives | Purpose | Location |
|---|---|---|---|
| Cloudflare (hosting, Workers) | Visitors' IP addresses and request details; feedback form submissions in transit | Serving the site, protecting it from attacks, running the feedback endpoint | Global edge network |

## Processing activities

| Data | Purpose | Lawful basis | Retention | Who can see it |
|---|---|---|---|---|
| IP address and request details | Delivering pages and protecting the site | Legitimate interests | The hosting provider's short-lived security logs only; the project keeps none | Cloudflare |

The site sets no cookies and runs no analytics or tracking.

The feedback form is not open. It will send to Engage once that exists; this record, the threat model and the privacy page are updated before it opens.

## Gaps to settle

- The feedback destination moves to Engage ([ADR-0004](adr/0004-feedback-goes-to-a-private-issue-tracker.md) will be superseded). Settle retention and processors then.

## Security measures

See the [threat model](threat-model.md) and [privacy rules](privacy.md).
