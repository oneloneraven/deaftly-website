# 3. A static Eleventy site, served by a Cloudflare Worker

## Status

Accepted

## Context

deaftly.com is a marketing, download and help site. It needs to be fast and
accessible, and readable without JavaScript. Its one dynamic part is the
feedback form.

The bootstrap gave a Vite app served by a Cloudflare Worker with static
assets, deployed on release tags. Climbing Logbook, by the same owner, already
builds its pages with Eleventy and serves them from a Worker.

## Decision

- **Eleventy builds every page** ahead of time, from Nunjucks and Markdown
  into `dist/`. Vite is removed, because nothing needs bundling.
- **Plain CSS with custom properties**, not Tailwind. The design tokens are the
  app's own, and one stylesheet is small enough to maintain by hand.
- **Fonts are self-hosted.** They're the app's Atkinson Hyperlegible Next and
  Bricolage Grotesque, cut down to the weights the site uses and to Latin
  characters.
- **Build-time data comes from the app repository.** The build reads the
  latest release (APK URL, version, size and notes) and the help pages at that
  release's tag, both through GitHub's API. If either read fails, the build
  fails.
- **The Worker** serves the static assets and handles `/api/health` and
  `/api/feedback`.
- **JavaScript is progressive enhancement only.** Help search is one small
  script. We considered Pagefind and rejected it: it needs
  `'wasm-unsafe-eval'` in the CSP, and nine help pages don't need it.

We screened Eleventy (MIT), markdown-it (MIT) and linkedom (ISC, tests only)
under [ADR-0002](0002-screen-dependencies-against-bds-boycott-lists.md). None
of them is listed. Cloudflare was screened for Climbing Logbook and isn't
listed.

## Consequences

- Pages are plain HTML with a strict CSP that allows only `'self'`.
- Each app release triggers a site rebuild, so the download button and help
  match the latest release.
- To change the help, change the app repository's `help/` folder and release
  the app.
