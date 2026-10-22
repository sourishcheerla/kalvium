const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("topic-search");
const results = document.getElementById("results");
const resultCount = document.getElementById("result-count");
const searchStatus = document.getElementById("search-status");
const emptyTitle = document.getElementById("empty-title");
const emptyDescription = document.getElementById("empty-description");
const clearButton = document.getElementById("clear-button");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    return;
  }

  results.innerHTML = "";
  searchStatus.hidden = false;
  searchStatus.textContent = "Searching the field guide...";
  resultCount.textContent = "Searching the field guide...";

  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=12` +
    "&prop=imageinfo&iiprop=url|mime&iiurlwidth=600&format=json&origin=*";

  try {
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

    searchStatus.hidden = true;

    if (renderedCount === 0) {
      emptyTitle.textContent = "No discoveries this time.";
      emptyDescription.textContent = "No results for that search. Try another word or phrase.";
      resultCount.textContent = `No results for “${query}”`;
      return;
    }

    resultCount.textContent = `Showing ${renderedCount} result${renderedCount === 1 ? "" : "s"} for “${query}”`;
  } catch (error) {
    searchStatus.hidden = true;
    emptyTitle.textContent = "The trail went quiet.";
    emptyDescription.textContent = "Something went wrong. Please try again.";
    resultCount.textContent = "Search unavailable";
    console.error("Image search failed:", error);
  }
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  results.innerHTML = "";
  searchStatus.hidden = true;
  emptyTitle.textContent = "Nothing pinned here. Yet.";
  emptyDescription.textContent = "Search for something you love and your visual field guide will begin to take shape.";
  resultCount.textContent = "Your discoveries will gather here";
  searchInput.focus();
});

document.querySelectorAll(".suggestion-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.textContent.trim();
    searchForm.requestSubmit();
  });
});
