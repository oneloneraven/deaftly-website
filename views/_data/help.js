import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchLatestRelease } from "../../lib/github-release.js";
import { fetchHelpFiles, helpPages } from "../../lib/help.js";

const fixture = process.env.DEAFTLY_HELP_FIXTURE;

/** @returns {Promise<import("../../lib/help.js").HelpFile[]>} */
async function fromFixture() {
  const dir = /** @type {string} */ (fixture);
  const names = (await readdir(dir)).filter(name => name.endsWith(".md"));
  return Promise.all(names.map(async name => ({ name, text: await readFile(join(dir, name), "utf8") })));
}

export default async () =>
  helpPages(fixture ? await fromFixture() : await fetchHelpFiles((await fetchLatestRelease()).tag));
