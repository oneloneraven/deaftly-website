const form = document.querySelector(".help-search");
const input = document.querySelector("#help-q");
const results = document.querySelector("#help-results");

if (form instanceof HTMLFormElement && input instanceof HTMLInputElement && results) {
  /** @type {Promise<Array<{ title: string, url: string, text: string }>> | undefined} */
  let index;
  const load = () => (index ??= fetch("/help/index.json").then(response => response.json()));

  const show = async () => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    results.replaceChildren();
    if (!words.length) return;
    const matches = (await load()).filter(page =>
      words.every(word => `${page.title} ${page.text}`.toLowerCase().includes(word)),
    );
    const heading = document.createElement("p");
    heading.textContent = matches.length
      ? `${matches.length} ${matches.length === 1 ? "page matches" : "pages match"}`
      : "No pages match. Try another word.";
    results.append(heading);
    if (!matches.length) return;
    const list = document.createElement("ul");
    for (const match of matches) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = match.url;
      link.textContent = match.title;
      item.append(link);
      list.append(item);
    }
    results.append(list);
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    show();
  });
  input.addEventListener("input", () => show());
  const query = new URLSearchParams(location.search).get("q");
  if (query) {
    input.value = query;
    show();
  }
}
