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
 * @returns {ReleaseEntry}
 */
function entry(release) {
  const apk = release.assets.find(asset => asset.name.endsWith(".apk"));
  if (!apk) throw new Error(`${release.tag_name} has no .apk asset yet`);
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
 * Reads the app's published releases. Fails loudly, so a build never ships without a working download.
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
  const [latest] = published;
  const releases = [
    entry(latest),
    ...published
      .slice(1)
      .filter(release => release.assets.some(asset => asset.name.endsWith(".apk")))
      .map(entry),
  ];
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
