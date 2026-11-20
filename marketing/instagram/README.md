# Instagram posts

One post per feature, as 1080×1440 (3:4 portrait) slides. Nothing here is built or deployed with the site.

- `posts.js`: every post's slides, caption and alt text. Each post opens with a cover slide and ends with the deaftly.com slide.
- `slides.js` and `slides.css`: the slide layouts, using the site's fonts from `static/fonts`.
- `screens/`: app screens from the app repo's `MarketingScreenshotTest` baselines (390×844dp at 2×), converted to lossless WebP.

## Rendering

Review every slide in a browser:

```bash
node marketing/instagram/render.mjs --serve
```

Write the PNGs and a `caption.txt` per post (caption, hashtags and numbered alt text for each slide) to `marketing/instagram/out/`, which git ignores:

```bash
CHROME=/path/to/chrome node marketing/instagram/render.mjs
```

`CHROME` can be any Chrome or Chrome Headless Shell binary, for example one installed with `pnpm dlx @puppeteer/browsers install chrome-headless-shell@stable`.

## Updating screens

When the app's screens change, re-record `MarketingScreenshotTest` in the app repo, then convert the PNGs you need into `screens/` as lossless WebP with the same names.

## Copy

Check every claim against the app's help pages. British English, sentence case, and no en or em dashes.
