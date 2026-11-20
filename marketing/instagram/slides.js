import { posts, slidesOf } from "./posts.js";

/**
 * @param {string} tag
 * @param {string} className
 * @param {string} [text]
 */
function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * @param {string} src
 * @param {number} [from]
 */
function phone(src, from = 0) {
  const frame = el("div", "phone");
  frame.style.setProperty("--from", String(from));
  const screen = el("div", "phone__screen");
  const image = /** @type {HTMLImageElement} */ (el("img", ""));
  image.alt = "";
  image.src = src;
  image.addEventListener("load", () => screen.style.setProperty("--bar", topColour(image)));
  screen.append(el("div", "phone__bar"), image);
  frame.append(screen);
  return frame;
}

/** @param {HTMLImageElement} image */
function topColour(image) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.drawImage(image, image.naturalWidth / 2, 0, 1, 1, 0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${r} ${g} ${b})`;
}

const glyphs = {
  keyboard: [
    "M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
    "M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8",
  ],
  faceToFace: [
    "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z",
    "M6 12h12M12 9V5M10 7l2-2 2 2M12 15v4M10 17l2 2 2-2",
  ],
  sideBySide: [
    "M4 3h9a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8l-3 3v-3H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    "M18 11h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v3l-3-3h-5a2 2 0 0 1-2-2v-2",
  ],
  mic: ["M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z", "M19 10v2a7 7 0 0 1-14 0v-2", "M12 19v3"],
};

/** @param {string[]} paths */
function glyph(paths) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "longpress__glyph");
  for (const d of paths) {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

/** @param {string[][]} shortcuts */
function longPress(shortcuts) {
  const scene = el("div", "longpress");
  const menu = el("div", "longpress__menu");
  for (const [label, icon] of shortcuts) {
    const row = el("div", "longpress__row");
    const disc = el("div", "longpress__disc");
    disc.append(glyph(glyphs[/** @type {keyof typeof glyphs} */ (icon)] ?? []));
    row.append(disc, el("span", "", label));
    menu.append(row);
  }
  const app = el("div", "longpress__app");
  const icon = /** @type {HTMLImageElement} */ (el("img", "longpress__icon"));
  icon.alt = "";
  icon.src = "screens/app-icon.png";
  app.append(icon, el("span", "", "Deaftly"));
  scene.append(menu, app);
  return scene;
}

/** @param {ReturnType<typeof slidesOf>[number]} slide */
function render(slide) {
  const root = el("section", `slide slide--${slide.type}`);
  if (slide.type === "cover") {
    root.append(
      el("p", "wordmark", "deaftly"),
      el("h1", "cover__headline", slide.headline),
      phone(slide.src, slide.from),
      el("p", "cover__feature", slide.feature),
    );
  } else if (slide.type === "screen") {
    root.append(el("h1", "screen__caption", slide.caption), phone(slide.src));
  } else if (slide.type === "text" || slide.type === "steps") {
    const list = el(slide.type === "steps" ? "ol" : "div", `text__body text__body--${slide.type}`);
    for (const line of slide.steps ?? slide.paragraphs ?? [])
      list.append(el(slide.type === "steps" ? "li" : "p", "", line));
    root.append(el("h1", "text__heading", slide.heading), list, el("p", "wordmark", "deaftly"));
  } else if (slide.type === "longpress") {
    root.append(el("h1", "screen__caption", slide.caption), longPress(slide.shortcuts ?? []));
  } else if (slide.type === "cta") {
    root.append(
      el("p", "wordmark", "deaftly"),
      el("h1", "cta__heading", slide.heading),
      el("p", "cta__line", slide.line),
      el("p", "cta__url", slide.url),
    );
  }
  return root;
}

const params = new URLSearchParams(location.search);
const root = /** @type {HTMLElement} */ (document.getElementById("root"));
const chosen = posts.find(post => post.id === params.get("post"));

if (chosen) {
  document.body.classList.add("single");
  root.append(render(slidesOf(chosen)[Number(params.get("slide") ?? 1) - 1]));
} else {
  root.className = "review";
  for (const post of posts) {
    const row = el("div", "review__post");
    for (const slide of slidesOf(post)) {
      const frame = el("div", "review__frame");
      frame.append(render(slide));
      row.append(frame);
    }
    root.append(row);
  }
}

document.fonts.ready.then(() => {
  const images = [...document.images].map(image => image.decode().catch(() => {}));
  Promise.all(images).then(() => document.body.setAttribute("data-ready", ""));
});
