export const APP_REPO = "oneloneraven/deaftly";

/**
 * @typedef {{ tag: string, version: string, publishedAt: string, apkUrl: string, apkSizeMb: string, notes: string[] }} ReleaseEntry
 * @typedef {ReleaseEntry & { releases: ReleaseEntry[] }} Release
 * @typedef {{ tag_name: string, draft: boolean, prerelease: boolean, published_at: string, body: string | null, assets: Array<{ name: string, size: number, browser_download_url: string }> }} GitHubRelease
 */

/**
 * The change lines from a GitHub-generated release body, without the author and link GitHub appends.
 * @param {string | null | undefined} body
 * @returns {string[]}
 */
export function releaseNotes(body) {
  return (body ?? "")
    .split("\n")
    .map(line => line.match(/^\s*[*-]\s+(.+?)(?:\s+by\s+@\S+(?:\s+in\s+\S+)?)?\s*$/)?.[1])
    .filter(/** @returns {line is string} */ line => Boolean(line));
}

/**
 * @param {GitHubRelease} release
 */
const apkOf = release => release.assets.find(asset => asset.name.endsWith(".apk"));

/**
 * @param {GitHubRelease} release
 * @returns {ReleaseEntry}
 */
function entry(release) {
  const apk = /** @type {NonNullable<ReturnType<typeof apkOf>>} */ (apkOf(release));
  return {
    tag: release.tag_name,
    version: release.tag_name.replace(/^v/, ""),
    publishedAt: release.published_at,
    apkUrl: apk.browser_download_url,
    apkSizeMb: (apk.size / 1_048_576).toFixed(1),
    notes: releaseNotes(release.body),
  };
}

/**
 * Reads the app's published releases. A release whose APK is still uploading is left out until it arrives;
 * the app's release workflow redeploys the site once it has. Fails loudly when no release has an APK, so a
 * build never ships without a working download.
 * @param {typeof fetch} [fetchImpl]
 * @param {{ token?: string }} [options]
 * @returns {Promise<Release>}
 */
export async function fetchLatestRelease(fetchImpl = fetch, { token = process.env.GITHUB_TOKEN } = {}) {
  /** @type {Record<string, string>} */
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetchImpl(`https://api.github.com/repos/${APP_REPO}/releases?per_page=30`, { headers });
  if (!response.ok) throw new Error(`GitHub releases API returned ${response.status}`);
  const published = /** @type {GitHubRelease[]} */ (await response.json())
    .filter(release => !release.draft && !release.prerelease)
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  if (!published.length) throw new Error(`${APP_REPO} has no published release`);
  if (!apkOf(published[0]))
    console.warn(`${published[0].tag_name} has no .apk asset yet, so the site uses the release before it`);
  const releases = published.filter(apkOf).map(entry);
  if (!releases.length) throw new Error(`${APP_REPO} has no release with an .apk asset yet`);
  return { ...releases[0], releases };
}

/** @type {Promise<Release> | undefined} */
let shared;

/**
 * The latest release, read once per build, so every page agrees on it.
 * @returns {Promise<Release>}
 */
export function latestReleaseForBuild() {
  shared ??= fetchLatestRelease();
  return shared;
}
