import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { captionOf, posts, slidesOf } from "./posts.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fonts = fileURLToPath(new URL("../../static/fonts/", import.meta.url));
const out = join(here, "out");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const server = createServer(async (request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname));
  const file = path.startsWith("/fonts/") ? join(fonts, path.slice(7)) : join(here, path === "/" ? "index.html" : path);
  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(undefined)));
const address = server.address();
const origin = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;

if (process.argv.includes("--serve")) {
  console.log(`Review all slides at ${origin}/`);
} else {
  const chrome = process.env.CHROME;
  if (!chrome) {
    server.close();
    throw new Error("Set CHROME to a Chrome or Chrome Headless Shell binary.");
  }
  const run = promisify(execFile);
  await rm(out, { recursive: true, force: true });
  for (const post of posts) {
    const folder = join(out, post.id);
    await mkdir(folder, { recursive: true });
    const slides = slidesOf(post);
    for (const [index, slide] of slides.entries()) {
      const name = `${String(index + 1).padStart(2, "0")}-${slide.type}.png`;
      await run(chrome, [
        "--headless",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--window-size=1080,1440",
        "--virtual-time-budget=5000",
        `--screenshot=${join(folder, name)}`,
        `${origin}/?post=${post.id}&slide=${index + 1}`,
      ]);
    }
    const alts = slides.map((slide, index) => `${index + 1}. ${slide.alt}`).join("\n");
    await writeFile(join(folder, "caption.txt"), `${captionOf(post)}\n\nAlt text\n\n${alts}\n`);
    console.log(`${post.id}: ${slides.length} slides`);
  }
  server.close();
}
