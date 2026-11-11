/** @param {import("@11ty/eleventy").UserConfig} config */
export default function (config) {
  config.addPassthroughCopy({ static: "/" });
  config.addFilter("helpIndex", (/** @type {Array<{ title: string, url: string, plain: string }>} */ pages) =>
    JSON.stringify(pages.map(({ title, url, plain }) => ({ title, url, text: plain }))),
  );
  return {
    dir: { input: "views", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
