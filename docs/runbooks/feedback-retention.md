# Feedback retention

The privacy page promises that feedback is deleted once it's been dealt with, and within 12 months at the latest ([ADR-0004](../adr/0004-feedback-goes-to-a-private-issue-tracker.md)).

## Monthly

1. List closed issues older than 12 months in `oneloneraven/deaftly-feedback`:
   ```bash
   gh issue list --repo oneloneraven/deaftly-feedback --state all --search "created:<$(date -d '-12 months' +%F)" --json number,title
   ```
2. Delete each one. Closing isn't enough: a closed issue still holds the message. Deleting needs admin on the repository:
   ```bash
   gh issue delete <number> --repo oneloneraven/deaftly-feedback --yes
   ```
3. Delete issues that have been dealt with as you close them, rather than waiting for the 12 months.

Until this is automated, it's a manual check (see the [record of processing](../data-protection.md)).
