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
