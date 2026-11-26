# Architecture decision records

Significant, hard-to-reverse decisions, one per file, in
[Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions):
Title, Status, Context, Decision, Consequences. Numbered `NNNN-title.md`.

An accepted ADR is never edited. A changed decision gets a new ADR, and the
old one's status becomes "Superseded by ADR-NNNN".

| ADR | Decision |
|---|---|
| 0001 | Record architecture decisions |
| 0002 | Screen dependencies and vendors against BDS boycott lists |
| 0003 | A static Eleventy site, served by a Cloudflare Worker |
| 0004 | Feedback goes to a private issue tracker |
| 0005 | Feedback goes to Engage |

Every ADR is kept in the private vault, at `oneloneraven-vault/deaftly-website/adr/`. This index lists their numbers and titles only.
