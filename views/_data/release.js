import { readFile } from "node:fs/promises";
import { fetchLatestRelease, latestReleaseForBuild } from "../../lib/github-release.js";

const fixture = process.env.DEAFTLY_RELEASES_FIXTURE;

/** @type {typeof fetch} */
const fromFixture = async () => new Response(await readFile(/** @type {string} */ (fixture), "utf8"));

export default () => (fixture ? fetchLatestRelease(fromFixture) : latestReleaseForBuild());
