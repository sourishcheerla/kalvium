const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("topic-search");
const results = document.getElementById("results");
const resultCount = document.getElementById("result-count");
const clearButton = document.getElementById("clear-button");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  results.innerHTML = "";
  resultCount.textContent = "Searching the field guide...";

  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12` +
    "&prop=imageinfo&iiprop=url|mime&iiurlwidth=600&format=json&origin=*";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image search failed with status ${response.status}.`);
  }

  const data = await response.json();
  const items = Object.values(data.query?.pages ?? {});
  let renderedCount = 0;

  items.forEach((item) => {
    const imageInfo = item.imageinfo?.[0];
    if (!imageInfo?.url || !imageInfo.mime?.startsWith("image/")) {
      return;
    }

    const title = item.title.replace(/^File:/, "").replace(/_/g, " ");
    const card = document.createElement("article");
    card.className = "result-card";

    const link = document.createElement("a");
    link.className = "result-image-link";
    link.href = imageInfo.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Open ${title} in a new tab`);

    const image = document.createElement("img");
    image.className = "result-image";
    image.src = imageInfo.thumburl || imageInfo.url;
    image.alt = title;
    image.loading = "lazy";
    image.decoding = "async";

    const caption = document.createElement("p");
    caption.className = "result-caption";
    caption.textContent = title;

    link.appendChild(image);
    card.appendChild(link);
    card.appendChild(caption);
    results.appendChild(card);
    renderedCount += 1;
  });

  resultCount.textContent = `Showing ${renderedCount} result${renderedCount === 1 ? "" : "s"} for “${query}”`;
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  results.innerHTML = "";
  resultCount.textContent = "Your discoveries will gather here";
  searchInput.focus();
});

document.querySelectorAll(".suggestion-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.textContent.trim();
    searchForm.requestSubmit();
  });
});
