const browse = document.getElementById("help-browse");
const wide = window.matchMedia("(min-width: 48rem)");
const sync = () => {
  if (browse instanceof HTMLDetailsElement) browse.open = wide.matches;
};
sync();
wide.addEventListener("change", sync);
