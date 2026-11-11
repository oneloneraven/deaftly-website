# deaftly.com website: design

Epic: [#136](https://github.com/ravendarque/deaftly/issues/136). Features #137–#144. Mockups: the "deaftly.com mockups" canvas (Home, Download, Help).

## Intent

Deaftly needs a public home that does three jobs, in this order of importance:

1. **Explain and attract.** Deaf people who've heard of Deaftly come to find out what it is. Search brings in deaf people who haven't heard of it. This is the main job.
2. **Download.** People arrive straight at the download page. It signposts the app stores and the direct APK, and explains what a direct install means and how to do it.
3. **Help.** People who already have the app look things up. Help will also be in the app ([#187](https://github.com/ravendarque/deaftly/issues/187)), so this is the least-used route.

The audience is deaf people. Many will be sceptical at first: "why not just type in my notes app?" G, a deaf collaborator, thought exactly that until they used it. The site answers that question head on.

## Goals

- Explain plainly what Deaftly does for someone in a real moment (at a counter, at the doctor's, ordering food), using the app's real features and names.
- Rank in search for the situations deaf people search about, through one page per situation.
- Make the direct APK install feel safe and straightforward for people who've never sideloaded.
- Give help that matches the app and can share one source with the in-app help (#187).
- Meet WCAG 2.2 AA, work without JavaScript where possible, use no tracking or third-party analytics, and set security headers (from #137).

## Non-goals

- iPhone or Play Store distribution. The site only signposts them as "Coming soon".
- Accounts, sign-in, or anything else server-side beyond the feedback form.
- A blog or news feed. "What's new" is release notes only.

## Anti-goals

- **Copy that misdescribes the app.** Every feature claim has to match the shipped app. The source of truth is the app's strings and the project board, never older docs or ADRs.
- **"No internet access" as a selling point or privacy claim.** It isn't a product principle. Don't use it anywhere on the site.
- Claims the project can't stand behind ("free", invented stats or testimonials). Monetisation is undecided ([#65](https://github.com/ravendarque/deaftly/issues/65)).
- Naming suppliers or detailing the architecture in public copy without the owner's sign-off. Google Play and the App Store are named because they're the signposts.
- An email address anywhere on the site (`docs/privacy.md`).

## Pages

| Page | Feature | Purpose |
|---|---|---|
| Home | #138 | The pitch. Answers "why not notes?" and links everywhere. |
| Tour | #144 | A walk through the hub, templates and Fill, Show, Type & show, Face to face, Side by side, the camera and settings, with screenshots and captions. |
| Situations (one page each) | addition to the epic | SEO landing pages: doctor's, ordering food, travel, shops and counters. More can follow. Each shows how Deaftly helps in that moment and links to download. |
| Download | #138 | Store signposts, the direct APK, why install directly, what to expect, how to install, signature check. |
| Help | #139 | Climbing Logbook's help structure: quick start, installing and updating, one page per feature, settings, troubleshooting. A help menu and search. |
| What's new | #141 | Release notes in plain English, generated from GitHub Releases, each linking to its download. |
| Ethics and sustainability | #140 | Dependency and supplier screening (ADR-0002), described as the process and its outcome without naming suppliers (the owner's decision, for now); no tracking, accessibility, a light site and an efficient app. |
| Privacy | #142 | What the app stores and where, and what the site and feedback form collect. Consistent with `docs/privacy.md` and `docs/data-protection.md`, with no "no internet" claim. |
| Feedback | #143 | Feedback and bug reports, with an optional app version. Privacy-respecting spam protection. |

## Content: how the features are described

Group the features the same way as the app's hub, and use the app's own names:

- **Show**
  - **Type & show:** type anything and show it full screen in big, clear text. Black on white, white on black, or yellow on black. Carry on as a chat.
  - **Templates:** messages you use often. Tap a highlighted word to change it, by picking from choices, typing it, or reading it with the camera. Pin them, sort them into categories, search them, write your own, or restore the built-ins.
- **Chat**
  - **Face to face:** type to someone opposite while keeping a secure grip on your phone. The keyboard faces you and the text faces them, upside down, so they read along as you type. It opens with "Hello. I'm deaf, so I'm typing to you. Read along here." Continue side by side to let them reply.
  - **Side by side:** a back-and-forth on one phone, laid out like a script in each person's colour. Turn prompts ("Your turn – type your reply here"), a turn switch, switching sides, bold, italic and highlight, quotes, text size, and inserting a template. Ending a chat deletes it.
- **Read text with the camera:** tap lines or drag across words, freeze the picture, use the torch, and add the text to your message.

**The Home hero gives all four features equal weight.** One headline covers the whole app ("Talk with people who can hear, quickly and simply."), then two panels show all four features at once: Show (Start typing, Templates) and Chat (Face to face, Side by side), mirroring the app's hub. No carousel, and no single feature as the hero. *(The owner's decision, from the mockup comparison.)*

The tone is plain British English, warm and direct. It speaks to a deaf reader as a peer. Big type, short paragraphs.

## Download page decisions

- **Cards:** Direct download (available now); Google Play (Coming soon); iPhone / App Store (Coming soon). The owner's call: being on the stores is necessary for people to use it.
- **Why install directly:** no Google account needed; works on phones without Google; ethics (wording to come from the owner, linking to the ethics page); built in public and signed with one key.
- **What to expect:** updates aren't automatic (how users hear about new versions is still open); Android warns you on install; Google Play Protect still scans it; templates and settings are kept when you update. No mention of sync.
- **How to install:** four steps from `docs/install.md`, then a fold-out with the signing fingerprint.
- **Download button:** points to the latest release APK, with the version and file size.

## Visual identity

Use the app's tokens (`ui/theme/DeaftlyColors.kt`) and fonts (`Type.kt`). Headings are set in Bricolage Grotesque 700/800. Body text is Atkinson Hyperlegible Next 400/500/700, at 19px or more.

| Token | Light | Dark |
|---|---|---|
| ground | #F7F6F2 | #14141A |
| surface | #FFFFFF | #1E1E26 |
| ink | #15151A | #F1F0EC |
| accent (violet) | #6A4596 | #C7A8E6 |
| personB (peach) | #FFD9B0 | #5C3A17 |
| highlight | #FFE15C | #FFE15C |

There's a light and a dark theme that follow the system setting. Use the wordmark "deaftly". Product images are real app screenshots (#138 and #144). The mockups use drawn stand-ins.

## How it gets made (builder's calls, stated)

- **Reference project:** Climbing Logbook ([ravendarque/climbing-logbook](https://github.com/ravendarque/climbing-logbook), checked out beside this repo). It uses Eleventy (ADR-0022) and Tailwind (ADR-0004), and runs as a single Cloudflare Worker serving static assets (ADR-0007). Its help pages are in `views/help/<topic>/index.md` with a `help-layout.njk` layout, and it has feedback, ethics-and-sustainability, privacy and whats-new pages to copy from. Cloudflare was screened under ADR-0002 there. Internal only: don't name it in site copy.
- **Domain and accounts:** the owner has registered deaftly.com (#136). The owner does any account set-up and DNS by hand, and creates the new repository.
- **Where it lives:** a separate repository, bootstrapped like Climbing Logbook, with its own CI, deploys and versioning. *(The owner's decision.)* Why: this repo cuts an app release from every user-facing PR (`docs/versioning.md`), so site changes here would release the app; the toolchains (Gradle against Node) and cadences (tagged releases against deploy on merge) differ too.
- **Stack:** Eleventy, Tailwind and a static build, as in Climbing Logbook. Record it in an ADR and screen it under ADR-0002.
- **Hosting:** a Cloudflare Worker with static assets, as in Climbing Logbook, deployed from CI on merge to `main`. Security headers are set there.
- **Mockups:** they set the direction for content order, hierarchy, tone and identity. They aren't pixel-binding.
- **Screenshots:** the builder captures real ones from the app (emulator or the existing Roborazzi screenshot setup) for Home, Tour and the situation pages. Home launches with real screenshots, not stand-ins. *(My call.)*
- **Download button:** links straight to the latest release's APK (`deaftly-X.Y.Z.apk`, as `release-artefacts.yml` already names it). The URL, version and size are filled in at build time from the latest GitHub Release. An app release triggers a site rebuild, so they don't go stale. No client-side JavaScript. *(My call.)*
- **Feedback form:** built in this work. The builder proposes the destination in an ADR for the owner's approval, following Climbing Logbook's feedback page where it fits. No visible email address or `mailto:`. The threat model and record of processing are updated. *(My call.)*
- **Help search:** may need JavaScript as progressive enhancement, for example a static index. Without JS, the help menu still reaches every page. *(My call.)*
- **SEO:** semantic HTML, a unique title and description per page, an XML sitemap, Open Graph images, and `SoftwareApplication` structured data on Home and Download. Situation pages target the phrases deaf people actually search for. That keyword research is part of the build.
- **Help source:** help Markdown lives in the app repo, so it changes in the same PR as the feature it describes. The site pulls it from the latest app release at build time, on the same release trigger that refreshes the download button, so the site's help always matches the released app. The app showing it in-app is #187 and is out of scope here. *(My call.)*
- **Install steps:** follow `docs/install.md` exactly (five steps). The mockup's four-step version is a stand-in.

## Left to the builder

- Page-by-page layout beyond the mockups, the components, and responsive details.
- How the tour is built (one long page or steps), provided it's accessible and works on a phone.
- Situation page copy, using the researched search phrases. The feature descriptions must stay as above.
- Build tooling details, CI steps, and caching and security headers.

## Open (owner)

- G's quote and how G wants to be credited, or no quote at all.
- The ethics wording on the download page.
- How direct-install users find out about new versions.