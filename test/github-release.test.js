import { expect, test } from "vitest";
import { fetchLatestRelease, releaseNotes } from "../lib/github-release.js";

const asset = (/** @type {string} */ version, size = 8_601_000) => ({
  name: `deaftly-${version}.apk`,
  size,
  browser_download_url: `https://github.com/oneloneraven/deaftly/releases/download/v${version}/deaftly-${version}.apk`,
});
const release = (/** @type {string} */ version, extra = {}) => ({
  tag_name: `v${version}`,
  draft: false,
  prerelease: false,
  published_at: "2026-11-11T09:30:00Z",
  body: "",
  assets: [asset(version)],
  ...extra,
});
const respond =
  (/** @type {unknown} */ body, status = 200) =>
  async () =>
    new Response(JSON.stringify(body), { status });

test("picks the newest release that isn't a draft or prerelease", async () => {
  const fetchImpl = respond([release("1.5.0", { prerelease: true }), release("1.4.0"), release("1.3.0")]);
  const latest = await fetchLatestRelease(fetchImpl);
  expect(latest.version).toBe("1.4.0");
  expect(latest.tag).toBe("v1.4.0");
  expect(latest.apkUrl).toMatch(/\/v1\.4\.0\/deaftly-1\.4\.0\.apk$/);
  expect(latest.apkSizeMb).toBe("8.2");
  expect(latest.publishedAt).toBe("2026-11-11T09:30:00Z");
  expect(latest.releases.map(r => r.tag)).toEqual(["v1.4.0", "v1.3.0"]);
});

test("reads the app repository's releases, with a token when there is one", async () => {
  /** @type {Array<{ url: string, init: RequestInit | undefined }>} */
  const calls = [];
  /** @type {typeof fetch} */
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify([release("1.0.0")]));
  };
  await fetchLatestRelease(fetchImpl, { token: "t0k" });
  expect(calls[0].url).toBe("https://api.github.com/repos/oneloneraven/deaftly/releases?per_page=30");
  expect(new Headers(calls[0].init?.headers).get("Authorization")).toBe("Bearer t0k");
});

test("throws when the API refuses", async () => {
  await expect(fetchLatestRelease(respond({ message: "rate limited" }, 403))).rejects.toThrow(
    "GitHub releases API returned 403",
  );
});

test("throws when the newest release has no APK yet", async () => {
  await expect(fetchLatestRelease(respond([release("1.4.0", { assets: [] })]))).rejects.toThrow(
    "v1.4.0 has no .apk asset yet",
  );
});

test("throws when there is no published release at all", async () => {
  await expect(fetchLatestRelease(respond([release("1.0.0", { draft: true })]))).rejects.toThrow(
    "no published release",
  );
});

test("release notes keep the change lines and drop GitHub's boilerplate", () => {
  const body = [
    "How to install and update Deaftly: https://github.com/oneloneraven/deaftly/blob/main/docs/install.md",
    "",
    "## What's Changed",
    "* Add a BSL interpreter built-in template by @someone in https://github.com/oneloneraven/deaftly/pull/194",
    "* Fix <script>alert(1)</script> in the editor by @someone in https://github.com/oneloneraven/deaftly/pull/195",
    "",
    "**Full Changelog**: https://github.com/oneloneraven/deaftly/compare/v0.40.2...v0.41.0",
  ].join("\n");
  expect(releaseNotes(body)).toEqual([
    "Add a BSL interpreter built-in template",
    "Fix <script>alert(1)</script> in the editor",
  ]);
});

test("release notes are empty when the body has no change lines", () => {
  expect(releaseNotes("")).toEqual([]);
  expect(releaseNotes(null)).toEqual([]);
});
