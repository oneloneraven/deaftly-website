/** @param {import("@11ty/eleventy").UserConfig} config */
export default function (config) {
  config.addPassthroughCopy({ static: "/" });
  config.addFilter("appData", (/** @type {{ version: string, apkUrl: string, publishedAt: string }} */ release) =>
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Deaftly",
      description:
        "Helps deaf people talk with people who can hear: show a message in big, clear text, use ready-made templates, or chat face to face on one phone.",
      url: "https://deaftly.com/",
      downloadUrl: release.apkUrl,
      operatingSystem: "Android 8.0+",
      applicationCategory: "CommunicationApplication",
      softwareVersion: release.version,
      datePublished: release.publishedAt.slice(0, 10),
      inLanguage: "en-GB",
    }).replaceAll("<", "\\u003c"),
  );
  config.addFilter("isoDate", (/** @type {string} */ value) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(value)),
  );
  config.addFilter("longDate", (/** @type {string} */ value) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/London",
    }).format(new Date(value)),
  );
  config.addFilter("helpIndex", (/** @type {Array<{ title: string, url: string, plain: string }>} */ pages) =>
    JSON.stringify(pages.map(({ title, url, plain }) => ({ title, url, text: plain }))),
  );
  return {
    dir: { input: "views", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
