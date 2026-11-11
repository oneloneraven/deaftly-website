# deaftly.com Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the static marketing, download and help site at deaftly.com described in the approved design.

**Architecture:** This is a new repository, set up like Climbing Logbook. Eleventy renders Nunjucks and Markdown into `public/`. A Cloudflare Worker serves those files as static assets and handles one dynamic route, `POST /feedback`. Data is fetched at build time from the app repo's latest GitHub Release: the APK URL, version and size, the release notes, and the help Markdown in that tag's `help/` folder. A release in the app repo triggers a site rebuild through `repository_dispatch`.

**Tech Stack:** Node and pnpm, Eleventy 3, Tailwind 4, Biome, Vitest, WebdriverIO with axe, Wrangler, Pagefind (help search, progressive enhancement). Each one is screened under ADR-0002.

**Spec:** `docs/superpowers/specs/2026-11-10-website-design.md`, copied into the new repo in Task 1. Until then it's at `/tmp/claude-1000/-home-raven--claude-spares-spare-DIWaas/43f4040e-7bd5-4751-a732-d797707bc7af/scratchpad/2026-11-10-website-design.md`. The mockups are the "deaftly.com mockups" canvas.

**Repositories:** Most tasks run in the **site repo**, working name `oneloneraven/deaftly-website`; the owner confirms the name in Task 1. Tasks marked **[app repo]** run in `ravendarque/deaftly`, following its workflow: an issue, a branch, a draft PR with a `release:` label, and `./gradlew check`.

## Global Constraints

- **Language:** British English (`lang="en-GB"`), in plain words, speaking to a deaf reader as a peer.
- **Feature names and descriptions** must match the spec's "Content" section and the app's `strings.xml`. Use exactly these names: Start typing / Type & show, Templates, Face to face, Side by side, Read text with the camera; and the groups Show and Chat.
- **Banned in any copy:** "no internet", "never leaves your phone", "offline-only", "free", invented statistics, invented testimonials, and email addresses or `mailto:`.
- **Suppliers:** name none in copy, except Google Play, the App Store and Google Play Protect. The Ethics page describes the screening process and its outcome only.
- **Store cards:** Google Play and iPhone both say "Coming soon". Direct download says "Available now".
- **Third parties:** no tracking or analytics, and no third-party requests from pages. Fonts are self-hosted. WCAG 2.2 AA. Pages work without JavaScript; search may use it.
- **Fonts:** Bricolage Grotesque 700/800 for headings; Atkinson Hyperlegible Next 400/500/700 for body text at 19px or more.
- **Tokens:**

  | Token | Light | Dark |
  |---|---|---|
  | ground | #F7F6F2 | #14141A |
  | surface | #FFFFFF | #1E1E26 |
  | ink | #15151A | #F1F0EC |
  | accent | #6A4596 | #C7A8E6 |
  | personB | #FFD9B0 | #5C3A17 |
  | highlight | #FFE15C | #FFE15C |

  Dark mode follows `prefers-color-scheme`.
- **Hero:** one H1, "Talk with people who can hear, quickly and simply.", with all four features visible at once in Show and Chat panels. No carousel.
- **Install steps:** follow `docs/install.md` in the app repo exactly. That's five steps, plus the "Check it is genuine" and "Update" sections.

## Review Focus

1. **The GitHub API fails or rate-limits during a build.** The build fails loudly. A deploy must never go out with an empty or broken download button. Tested in Task 3.
2. **The latest release has no `.apk` asset yet,** because the artefact job is still running. The build fails with a clear message instead of linking to nothing. Tested in Task 3.
3. **The help Markdown in an app tag is missing or malformed** (no front matter, or a broken link to a page that doesn't exist). The build fails, naming the file. Tested in Task 5.
4. **A feedback submission is empty, oversized, spam, or contains HTML or script.** It's rejected or escaped, never echoed back raw. Tested in Task 10.
5. **Someone reads the site at 200% zoom on a 320px-wide phone.** Nothing scrolls sideways, and the Show and Chat panels stack. Tested in Task 12.

---

### Task 1: Bootstrap the site repository

**Files:** everything the `project-bootstrap` skill scaffolds; `docs/superpowers/specs/2026-11-10-website-design.md`; `docs/adr/0003-eleventy-and-a-static-assets-worker.md`.

**Interfaces:**
- Produces: a repo with `main` protected, CI running lint, typecheck and test, tag-based releases, and `CLAUDE.md` plus docs (privacy, threat model, ADR-0001 and ADR-0002 screening).

- [ ] **Step 1:** Ask the owner to approve creating the public repo `oneloneraven/deaftly-website`, or the name they choose. Stop until they say yes.
- [ ] **Step 2:** Run the `project-bootstrap` skill with the modules `core`, `js-toolchain`, `web-app` and `cloudflare-opentofu`.
- [ ] **Step 3:** Copy the spec and this plan into `docs/superpowers/`.
- [ ] **Step 4:** Write ADR-0003. Record Eleventy, Tailwind, a Worker with static assets, and Pagefind, each screened under ADR-0002 and referencing Climbing Logbook's ADR-0007, ADR-0021 and ADR-0022.
- [ ] **Step 5:** Run `pnpm lint && pnpm test`. Expected: pass on the empty scaffold.
- [ ] **Step 6:** Open a PR with the bootstrap, merge it once CI passes, then cut the issues for Tasks 2–12 under epic #136. The site repo's issues link back to the app repo's #137–#144.

### Task 2: Base layout, tokens, fonts and headers

**Files:**
- Create: `.eleventy.js`, `views/_includes/base.njk`, `views/_includes/site-header.njk`, `views/_includes/site-footer.njk`, `styles/tailwind.css`, `static/fonts/` (woff2 files converted from the app's `atkinson_hyperlegible_next.ttf` and `bricolage_grotesque.ttf`), `static/_headers`
- Test: `test/build/base-layout.test.js`, `test/build/headers.test.js`

**Interfaces:**
- Produces: the layout `base.njk`, taking front matter `title`, `description` and `ogImage`, and an optional `bodyClass`. Pages use `layout: base.njk`.
- Produces: the helper `buildSite(): Promise<Map<string, string>>` in `test/helpers/build.js`. It runs Eleventy into a temp directory and returns output paths mapped to HTML. Later tests use it.

- [ ] **Step 1: Write failing tests.** `base-layout.test.js` builds a fixture page and asserts:
  - `<html lang="en-GB">`
  - a `<title>` of the form `{title} – Deaftly`
  - a meta description
  - a skip link to `#main`
  - nav links, in this order: Tour, Situations, Help, Get the app
  - footer links: Download, Tour, Help, What's new, Ethics and sustainability, Privacy, Feedback
  - no `fonts.googleapis.com` anywhere in the output
  - no `mailto:` anywhere in the output

  `headers.test.js` asserts that `public/_headers` sets `Content-Security-Policy` (with `default-src 'self'` and no third-party hosts), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy`.
- [ ] **Step 2:** Run `pnpm test test/build`. Expected: FAIL.
- [ ] **Step 3:** Implement the layout, the tokens as CSS custom properties (with `@media (prefers-color-scheme: dark)`), `@font-face` for the self-hosted fonts, and `_headers`.
- [ ] **Step 4:** Run `pnpm test test/build`. Expected: PASS.
- [ ] **Step 5:** Commit: "Add the base layout, design tokens, self-hosted fonts and security headers".

### Task 3: Latest release data

**Files:**
- Create: `views/_data/release.js`, `lib/github-release.js`
- Test: `test/lib/github-release.test.js`

**Interfaces:**
- Produces: `fetchLatestRelease(fetchImpl = fetch): Promise<Release>`, where
  `Release = { version: string, tag: string, apkUrl: string, apkSizeMb: string, publishedAt: string, releases: Array<{ tag, version, name, bodyHtml, publishedAt, apkUrl }> }`.
  It reads `GET https://api.github.com/repos/ravendarque/deaftly/releases?per_page=30`, skipping drafts and prereleases. It uses `GITHUB_TOKEN` from the environment when that's set.
- Produces: Eleventy global data `release`, which is the `Release` above.

- [ ] **Step 1: Write failing tests** with a fake `fetchImpl`:
  - `picks the newest non-prerelease`: `version` is `"1.4.0"`, `apkUrl` ends `/v1.4.0/deaftly-1.4.0.apk`, and `apkSizeMb` is `"8.2"` for an asset of 8,601,000 bytes (one decimal place).
  - `throws when the API returns non-200`: the message contains `GitHub releases API returned 403`.
  - `throws when the newest release has no .apk asset`: the message contains `v1.4.0 has no .apk asset yet`.
  - `renders release notes Markdown to HTML and escapes raw HTML`: a body of `<script>x</script>` doesn't come out as a `<script>` tag.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement `fetchLatestRelease`. Render Markdown with markdown-it with `html: false`.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: "Read the latest app release at build time".

### Task 4: Home and Download pages

**Files:**
- Create: `views/index.njk`, `views/download/index.njk`, `views/_includes/feature-panels.njk`, `views/_includes/store-cards.njk`
- Test: `test/build/home.test.js`, `test/build/download.test.js`

**Interfaces:**
- Consumes: `release` from Task 3, and `base.njk` and `buildSite()` from Task 2.

- [ ] **Step 1: Write failing tests.**

  `home.test.js` asserts:
  - exactly one `<h1>`, with the text "Talk with people who can hear, quickly and simply."
  - panels headed Show and Chat, containing Start typing and Templates, and Face to face and Side by side, in that order
  - the "Can't I just type in my notes app?" section
  - the camera section
  - situation links to `/situations/doctors/`, `/situations/ordering-food/`, `/situations/travel/` and `/situations/shops/`
  - a quote block, but only when the data file `views/_data/quote.json` has `"approved": true`
  - none of the banned phrases from Global Constraints anywhere on the page

  `download.test.js` asserts:
  - three cards: "Direct download / Available now", "Google Play / Coming soon", "iPhone / Coming soon"
  - the primary button's `href` equals `release.apkUrl`, and its text contains the version and size
  - "Why download it directly" has four reasons, and the ethics reason links to `/ethics/`
  - "What to expect" has four items and no mention of sync
  - the five install steps match `docs/install.md`, as a fixture copied from the app repo
  - the signing fingerprint `CD:70:A2:F4:…:6A:53:EB` appears in full, inside a `<details>`
- [ ] **Step 2:** Run `pnpm test test/build`. Expected: FAIL.
- [ ] **Step 3:** Build both pages from the mockups (Home with option B as the hero; Download). The copy is exactly as on the canvas, except for placeholders. Any `[…]` placeholder becomes a front matter field, and the build fails if a placeholder is still unresolved in a production build.
- [ ] **Step 4:** Run `pnpm test test/build`. Expected: PASS.
- [ ] **Step 5:** Commit: "Add the home and download pages".

### Task 5: Help section from the app's help source

**Files:**
- Create: `scripts/fetch-help.mjs`, `views/help/help.11tydata.js`, `views/_includes/help-layout.njk`, `views/help/index.njk`
- Test: `test/scripts/fetch-help.test.js`, `test/build/help.test.js`

**Interfaces:**
- Consumes: `release.tag` from Task 3, and the `help/` folder in the app repo from Task A1.
- Produces: `fetchHelp(tag: string, destDir: string, fetchImpl = fetch): Promise<string[]>`. It downloads `https://codeload.github.com/ravendarque/deaftly/tar.gz/refs/tags/{tag}`, extracts only `help/**/*.md` into `views/help/`, and returns the paths it wrote. It runs as a `prebuild` script.

- [ ] **Step 1: Write failing tests.** `fetch-help.test.js` uses a fixture tarball and asserts:
  - only `help/` files are written
  - a page without front matter `title` and `order` throws `help/foo.md is missing title`
  - a link to a help page that doesn't exist throws `help/a.md links to missing page b`

  `help.test.js` asserts:
  - the help menu lists the topics in front matter `order`: Quick start, Installing and updating, Templates, Show and Type & show, Face to face, Side by side, Reading text with the camera, Settings, Troubleshooting
  - each page has one H1
  - the search form has a `<label>`
  - without JavaScript, the menu still links to every page
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement `fetchHelp` and the help layout, modelled on Climbing Logbook's `help-layout.njk`. Add Pagefind indexing of `/help/` as a post-build step.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit: "Build the help section from the app's help source".

### Task 6: Tour page

**Files:** `views/tour/index.njk`, `static/screenshots/*.webp`, `test/build/tour.test.js`

- [ ] **Step 1: Write failing tests.** Sections appear in this order: the hub, Templates and Fill, Show, Type & show, Face to face, Side by side, the camera, Settings. Every `<img>` has non-empty `alt`, plus `width` and `height`. Every caption is real text, not baked into an image.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Capture the screenshots from the app on an emulator, from the latest release, in light theme, at 1080×2400, then convert them to WebP. Build the page.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit: "Add the tour of the app".

### Task 7: Situation pages

**Files:** `views/situations/situations.11tydata.js`, `views/situations/{doctors,ordering-food,travel,shops}.md`, `views/_includes/situation-layout.njk`, `docs/seo-keywords.md`, `test/build/situations.test.js`

- [ ] **Step 1:** Research the search phrases deaf people in the UK use for each situation. Record them, with sources, in `docs/seo-keywords.md`.
- [ ] **Step 2: Write failing tests.** Each page:
  - has a unique `<title>` and meta description containing its primary phrase from `seo-keywords.md`
  - names at least one feature by its exact name
  - links to `/download/`
  - contains none of the banned phrases
- [ ] **Step 3:** Run it. Expected: FAIL.
- [ ] **Step 4:** Write the four pages, using real template wording from the app's built-in templates where it fits.
- [ ] **Step 5:** Run it. Expected: PASS.
- [ ] **Step 6:** Commit: "Add situation pages".

### Task 8: What's new

**Files:** `views/whats-new/index.njk`, `test/build/whats-new.test.js`

- **Interfaces:** consumes `release.releases` from Task 3.

- [ ] **Step 1: Write a failing test.** Entries come newest first. Each shows its version, a date as `11 November 2026`, the notes HTML and a download link equal to that entry's `apkUrl`.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Build the page.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit: "Add what's new".

### Task 9: Ethics and Privacy pages

**Files:** `views/ethics/index.md`, `views/privacy/index.md`, `test/build/statements.test.js`

- [ ] **Step 1: Write failing tests.**
  - Ethics covers dependency and supplier screening, as a process and its outcome only, plus no tracking, accessibility, a light static site and an efficient app.
  - Ethics names no supplier: the test checks against a denylist kept in the test, made of the suppliers listed in ADR-0002 records.
  - Privacy covers the app (what it stores on the phone, and Android backup) and the site (what the feedback form collects, why, and for how long).
  - Neither page contains a banned phrase.
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Write both pages, modelled on Climbing Logbook's `views/help/ethics-and-sustainability/` and `views/help/privacy/`, and consistent with the app repo's `docs/privacy.md` and `docs/data-protection.md`. Update the site repo's record of processing for the feedback form.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit: "Add the ethics and privacy statements".

### Task 10: Feedback form and Worker endpoint

**Files:**
- Create: `docs/adr/0004-feedback-destination.md`, `server/index.js`, `server/feedback.js`, `views/feedback/index.njk`, `views/feedback/thanks.njk`
- Test: `test/server/feedback.test.js`, `test/build/feedback-page.test.js`

**Interfaces:**
- Produces: `handleFeedback(request: Request, env: { FEEDBACK_TOKEN: string, FEEDBACK_REPO: string, TURNSTILE_SECRET?: string }, fetchImpl = fetch): Promise<Response>`. It accepts a form post with the fields `kind` (`feedback` | `bug`), `message` (1–5000 characters), `appVersion` (optional, matching `^\d+\.\d+\.\d+$`) and the honeypot `website` (must be empty). On success it responds `303` to `/feedback/thanks/`.

- [ ] **Step 1:** Write ADR-0004. It proposes the destination, which defaults to a GitHub issue in a private triage repo, and the spam protection, modelled on Climbing Logbook's feedback page. Get the owner's approval before Step 3. Update the threat model.
- [ ] **Step 2: Write failing tests.**
  - an empty `message` gives 400
  - a 5001-character `message` gives 400
  - a filled honeypot gives 303 to the thanks page, but no issue is created
  - `<script>` in `message` is sent to the destination as escaped text and never echoed in a response
  - a valid post creates exactly one issue and gives 303
  - a destination failure gives 502 and a page saying "Something went wrong", with no stack trace
  - the form page has a `<label>` for every field, no email field, and works without JavaScript
- [ ] **Step 3:** Run the tests. Expected: FAIL.
- [ ] **Step 4:** Implement `handleFeedback` and the route in `server/index.js`. In `wrangler.jsonc`, `run_worker_first` is limited to `["/feedback"]`.
- [ ] **Step 5:** Run the tests. Expected: PASS.
- [ ] **Step 6:** Commit: "Add the feedback form".

### Task 11: SEO metadata

**Files:** `views/sitemap.xml.njk`, `views/robots.txt.njk`, `views/_includes/structured-data.njk`, `static/og/*.png`, `test/build/seo.test.js`

- [ ] **Step 1: Write failing tests.**
  - every page has a unique title and description, a canonical URL on `https://deaftly.com`, and `og:title`, `og:description` and `og:image`
  - `sitemap.xml` lists every non-404 page
  - Home and Download carry `SoftwareApplication` JSON-LD with `operatingSystem: "Android 8.0+"`, `applicationCategory: "CommunicationApplication"` and `softwareVersion` equal to `release.version`, and no `offers` or `price`
- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Implement the metadata.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit: "Add SEO metadata, a sitemap and structured data".

### Task 12: Accessibility and layout checks, deploy and release trigger

**Files:**
- Create: `e2e/accessibility.e2e.js`, `e2e/responsive.e2e.js`, `.github/workflows/deploy.yml`
- Modify [app repo]: `.github/workflows/release-artefacts.yml`, with a step after `gh release upload`

**Interfaces:**
- Produces: `deploy.yml`, triggered on `push` to `main`, `repository_dispatch` with type `app-released`, and `workflow_dispatch`. It runs `pnpm build && wrangler deploy`.

- [ ] **Step 1: Write failing e2e tests.**
  - axe finds no violations at the WCAG 2.2 AA level on every page, in both light and dark mode.
  - At a 320×640 viewport with 200% zoom, every page has `scrollWidth <= clientWidth`.
  - On Home, the Chat panel's top edge sits below the Show panel's bottom edge (the panels stack).
- [ ] **Step 2:** Run `pnpm test:e2e`. Expected: FAIL until any problems are fixed, then PASS.
- [ ] **Step 3:** Add `deploy.yml`. The owner sets up DNS for `deaftly.com`, the Cloudflare API token, and the `FEEDBACK_TOKEN` and `TURNSTILE_SECRET` secrets.
- [ ] **Step 4 [app repo]:** Add a step to `release-artefacts.yml` that runs `gh api repos/oneloneraven/deaftly-website/dispatches -f event_type=app-released` using a fine-grained token secret, `SITE_DISPATCH_TOKEN`, which the owner creates. It goes in its own app repo issue and PR, labelled `release: none`.
- [ ] **Step 5: Verify.** Publish a test dispatch. The site deploys, and `https://deaftly.com/download/` shows the current version.
- [ ] **Step 6:** Commit: "Deploy to deaftly.com and rebuild on each app release".

### Task A1 [app repo]: Help source in the app repo

**Files:**
- Create: `help/quick-start.md`, `help/installing-and-updating.md`, `help/templates.md`, `help/show.md`, `help/face-to-face.md`, `help/side-by-side.md`, `help/camera.md`, `help/settings.md`, `help/troubleshooting.md`
- Test: the help path and front matter check below

**Interfaces:**
- Produces: Markdown files with front matter `title: string` and `order: number` (1–9, in the list order above). They link to each other relatively, as `[Templates](templates.md)`. `installing-and-updating.md` is `docs/install.md` adapted for readers; `docs/install.md` stays as it is.

- [ ] **Step 1:** Open an issue, create the branch `docs/help-source`, and open a draft PR labelled `release: none` (once `help/**` is added to `.github/release-paths.json` in the same PR).
- [ ] **Step 2:** Write the nine pages from the current app's behaviour and `strings.xml`, using the feature names exactly. Check each claim against the running app.
- [ ] **Step 3:** Add a CI step to `test.yml` that fails when a `help/*.md` file lacks `title` or `order`, or links to a missing file.
- [ ] **Step 4:** Run `./gradlew check` and the new step. Expected: PASS.
- [ ] **Step 5:** Commit, mark the PR ready, and merge once checks pass.

## Order

Do Task 1 first, then Task 2 and Task A1. Task A1 can run in parallel with Tasks 2–4 because it's in the other repo. Then do Tasks 3 → 4 → 5 (which needs A1 released in a tag) → 6 → 7 → 8 → 9 → 10 → 11 → 12.
