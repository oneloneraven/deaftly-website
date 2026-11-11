# 4. Feedback goes to a private issue tracker

## Status

Accepted

## Context

The site needs a feedback and bug report form that:

- works without JavaScript
- asks only for what's needed
- resists spam without tracking anyone
- never publishes an email address

## Decision

- **Destination:** each submission becomes an issue in the private repository
  `oneloneraven/deaftly-feedback`, labelled `feedback` or `bug`. The Worker
  creates the issue with a fine-grained token, `FEEDBACK_TOKEN`, stored as a
  Worker secret. The token is limited to Issues: read and write, on that
  repository only.
- **Fields:** the kind of message, the message itself (1 to 5,000 characters)
  and an optional app version. The form asks for no name or email address.
- **Spam protection:**
  - A honeypot field. If it's filled in, the Worker answers as if the post
    succeeded but creates nothing.
  - A Workers rate limit of 5 posts a minute per IP address.
  - No CAPTCHA, because it would add a third party, and some CAPTCHA services
    set cookies.
- **Safety:**
  - The message is stored inside a code fence longer than any run of backticks
    in it, so nothing in it renders and no one gets mentioned.
  - Error pages never repeat what was submitted.
- **Retention:** issues are deleted once they've been dealt with, and within
  12 months at the latest.

## Consequences

- Nobody can be replied to directly. The form says so.
- The maintainer sets the token as a secret on the production Worker.
- Old feedback has to be deleted by hand until that's automated (see the
  [record of processing](../data-protection.md)).
