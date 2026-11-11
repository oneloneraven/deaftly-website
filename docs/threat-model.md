# Threat model

What Deaftly website protects, from whom, and how. Update it in the same PR as any
change that adds or moves a trust boundary ([coding standards](coding-standards.md#security)).

## The system

Describe the components, where each runs, and how data flows between them.

## Trust boundaries

| Boundary | Between | What crosses it | Controls |
|---|---|---|---|
| Visitor → Worker `/api/feedback` | Anyone on the internet and the Worker | Form posts: kind, message, optional app version | Field validation and length limits, honeypot, rate limit of 5 a minute per IP, no echo in responses |
| Worker → GitHub Issues API | The Worker and the private feedback repository | Issue title and body, `FEEDBACK_TOKEN` | Fine-grained token limited to Issues on that one repository; message fenced so nothing renders or mentions |
| Build → GitHub API | CI builds and the app repository | Release list and help files, read with the workflow's token | Read-only; the build fails on any error instead of shipping a broken download |
| Release job → GitHub API | `release.yml` and the release GitHub App | Short-lived App token (Contents and Workflows: read and write) to push release tags and create releases | Token minted only in the release job and scoped to this repository; App installed on this repository only; private key held as a repository secret |

## Assets

| Asset | Why it matters |
|---|---|
| `FEEDBACK_TOKEN` | Anyone holding it can read and write issues in the private feedback repository |
| Feedback in the issue tracker | People may include personal details despite being asked not to |
| Release App private key | Anyone holding it can mint tokens that push tags and, through Workflows, change workflow files |

## Actors

| Actor | Capability | Motivation |
|---|---|---|
| Anonymous internet user | Any public request | Abuse, data access |
| Signed-in user | Their own account | Access to others' data |
| Compromised dependency | Code execution at install or runtime | Credential theft |
| Maintainer account takeover | Repository and platform access | Anything |

## Threats (STRIDE)

| Threat | Category | Mitigation | Status |
|---|---|---|---|
| Spam or abuse through the feedback form | Spoofing | Honeypot, rate limit per IP, length limits | Mitigated |
| Markdown or HTML in a message renders or pings people in the issue tracker | Tampering | Message fenced in a code block longer than any backtick run | Mitigated |
| | Repudiation | | |
| A submission or the token leaks through an error page | Information disclosure | Error pages are fixed text; responses never echo input or upstream errors | Mitigated |
| Flooding the form exhausts the GitHub API or fills the tracker | Denial of service | Rate limit per IP; GitHub's own limits on the token | Accepted |
| Leaked release token or App key used to alter workflow files | Elevation of privilege | The Workflows permission is needed because GitHub refuses a tag whose commit's workflow files differ from the default branch's. Tokens last one hour and are minted only in the release job; the key is a repository secret; the App is installed on this repository only | Accepted |

## Known gaps

None recorded yet.
