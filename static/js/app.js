/**
 * QuoteVault - Vanilla JavaScript Frontend
 * Handles state, API fetching, search & filtering, DOM updates, and clipboard interactions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const spotlightCard = document.getElementById("spotlight-card");
  const spotlightText = document.getElementById("spotlight-text");
  const spotlightAuthor = document.getElementById("spotlight-author");
  const spotlightCategory = document.getElementById("spotlight-category");

  const btnNewQuote = document.getElementById("btn-new-quote");
  const btnCopySpotlight = document.getElementById("btn-copy-spotlight");
  const btnFilterAuthor = document.getElementById("btn-filter-author");

  const searchInput = document.getElementById("search-input");
  const btnClearSearch = document.getElementById("btn-clear-search");
  const categorySelect = document.getElementById("category-select");
  const authorSelect = document.getElementById("author-select");
  const categoryChipsContainer = document.getElementById("category-chips");
  const btnResetFilters = document.getElementById("btn-reset-filters");
  const btnEmptyReset = document.getElementById("btn-empty-reset");
  const btnExportCsv = document.getElementById("btn-export-csv");

  const quotesGrid = document.getElementById("quotes-grid");
  const emptyState = document.getElementById("empty-state");
  const countShown = document.getElementById("count-shown");
  const countTotal = document.getElementById("count-total");
  const totalQuotesBadge = document.getElementById("total-quotes-badge");
  const toast = document.getElementById("toast");

  // --- State ---
  let currentSpotlightQuote = null;
  let debounceTimeout = null;
  let activeCategory = "all";
  let activeAuthor = "all";
  let activeSearchQuery = "";
  let toastTimer = null;

  // --- API Functions ---
  async function fetchRandomQuote(excludeId = null) {
    try {
      spotlightCard.classList.add("fading");
      const url = new URL("/api/quotes/random", window.location.origin);
      if (excludeId) url.searchParams.set("exclude_id", excludeId);

      const res = await fetch(url);
      const json = await res.json();

      setTimeout(() => {
        if (json.status === "success" && json.data) {
          currentSpotlightQuote = json.data;
          renderSpotlight(json.data);
        }
        spotlightCard.classList.remove("fading");
      }, 150);
    } catch (err) {
      console.error("Error fetching random quote:", err);
      spotlightCard.classList.remove("fading");
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.status === "success") {
        populateCategories(json.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }

  async function fetchAuthors() {
    try {
      const res = await fetch("/api/authors");
      const json = await res.json();
      if (json.status === "success") {
        populateAuthors(json.data);
      }
    } catch (err) {
      console.error("Error fetching authors:", err);
    }
  }

  async function fetchQuotes() {
    try {
      const url = new URL("/api/quotes", window.location.origin);
      if (activeSearchQuery) url.searchParams.set("q", activeSearchQuery);
      if (activeCategory && activeCategory !== "all") url.searchParams.set("category", activeCategory);
      if (activeAuthor && activeAuthor !== "all") url.searchParams.set("author", activeAuthor);

      const res = await fetch(url);
      const json = await res.json();

      if (json.status === "success") {
        renderQuotesList(json.data, json.count, json.total);
      }
    } catch (err) {
      console.error("Error fetching quotes:", err);
    }
  }

  // --- Render Functions ---
  function renderSpotlight(quote) {
    spotlightText.textContent = `“${quote.quote}”`;
    spotlightAuthor.textContent = quote.author;
    spotlightCategory.textContent = quote.category;
  }

  function populateCategories(categories) {
    categorySelect.innerHTML = `<option value="all">All Categories</option>`;
    categoryChipsContainer.innerHTML = `<button class="chip active" data-category="all">All</button>`;

    categories.forEach(cat => {
      // Dropdown option
      const opt = document.createElement("option");
      opt.value = cat.name;
      opt.textContent = `${cat.name} (${cat.count})`;
      categorySelect.appendChild(opt);

      // Chip button
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.dataset.category = cat.name;
      chip.textContent = cat.name;
      categoryChipsContainer.appendChild(chip);
    });
  }

  function populateAuthors(authors) {
    authorSelect.innerHTML = `<option value="all">All Authors</option>`;
    authors.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.name;
      opt.textContent = `${item.name} (${item.count})`;
      authorSelect.appendChild(opt);
    });
  }

  function highlightMatches(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    return escaped.replace(regex, `<span class="highlight">$1</span>`);
  }

  function renderQuotesList(quotes, count, total) {
    countShown.textContent = count;
    countTotal.textContent = total;
    if (totalQuotesBadge) {
      totalQuotesBadge.textContent = `${total} Quotes`;
    }

    if (count === 0) {
      quotesGrid.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    quotesGrid.innerHTML = quotes.map(q => {
      const highlightedText = highlightMatches(q.quote, activeSearchQuery);
      const highlightedAuthor = highlightMatches(q.author, activeSearchQuery);

      return `
        <article class="quote-card" data-id="${q.id}">
          <div class="quote-card-body">
            <p class="quote-card-text">“${highlightedText}”</p>
            <div class="quote-card-author">— ${highlightedAuthor}</div>
          </div>
          <div class="quote-card-footer">
            <span class="card-category-tag" data-category="${escapeHtml(q.category)}" title="Filter by this category">
              ${escapeHtml(q.category)}
            </span>
            <button class="btn-card-copy" data-quote="${escapeHtml(q.quote)}" data-author="${escapeHtml(q.author)}" title="Copy quote">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>Copy</span>
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  // --- Helper Functions ---
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  function setButtonCopiedState(btn) {
    if (!btn) return;
    const originalHtml = btn.innerHTML;
    btn.classList.add("copied");
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Copied!</span>
    `;
    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.classList.remove("copied");
    }, 1600);
  }

  function copyToClipboard(text, author, btn = null) {
    const formatted = `"${text}"\n— ${author}`;
    const onCopied = () => {
      showToast("Quote copied to clipboard!");
      if (btn) setButtonCopiedState(btn);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formatted).then(onCopied).catch(() => {
        fallbackCopy(formatted);
        if (btn) setButtonCopiedState(btn);
      });
    } else {
      fallbackCopy(formatted);
      if (btn) setButtonCopiedState(btn);
    }
  }

  async function exportToCSV() {
    const url = new URL("/api/quotes/export", window.location.origin);
    if (activeSearchQuery) url.searchParams.set("q", activeSearchQuery);
    if (activeCategory && activeCategory !== "all") url.searchParams.set("category", activeCategory);
    if (activeAuthor && activeAuthor !== "all") url.searchParams.set("author", activeAuthor);

    try {
      showToast("Generating CSV export...");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const count = countShown.textContent || "100";
      const catSlug = activeCategory === "all" ? "all" : activeCategory.toLowerCase().replace(/[^a-z0-9]/g, "_");
      a.download = `quotes_${catSlug}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`Exported ${count} quotes to CSV!`);
    } catch (err) {
      console.error("Export error:", err);
      showToast("Could not export CSV");
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast("Quote copied to clipboard!");
    } catch (e) {
      showToast("Could not copy quote");
    }
    document.body.removeChild(textarea);
  }

  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function syncCategoryUI(selectedCategory) {
    activeCategory = selectedCategory;
    categorySelect.value = selectedCategory;

    // Update chips active class
    const chips = categoryChipsContainer.querySelectorAll(".chip");
    chips.forEach(chip => {
      if (chip.dataset.category === selectedCategory) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  }

  function resetAllFilters() {
    activeSearchQuery = "";
    activeAuthor = "all";
    activeCategory = "all";

    searchInput.value = "";
    btnClearSearch.classList.add("hidden");
    authorSelect.value = "all";
    syncCategoryUI("all");

    fetchQuotes();
  }

  // --- Event Listeners ---

  // Get New Random Quote
  btnNewQuote.addEventListener("click", () => {
    fetchRandomQuote(currentSpotlightQuote ? currentSpotlightQuote.id : null);
  });

  // Copy Spotlight Quote
  btnCopySpotlight.addEventListener("click", () => {
    if (currentSpotlightQuote) {
      copyToClipboard(currentSpotlightQuote.quote, currentSpotlightQuote.author, btnCopySpotlight);
    }
  });

  // Filter by Author of Spotlight Quote
  btnFilterAuthor.addEventListener("click", () => {
    if (currentSpotlightQuote) {
      activeAuthor = currentSpotlightQuote.author;
      // Sync author dropdown if option exists, otherwise set to closest match or use search
      const optionExists = Array.from(authorSelect.options).some(o => o.value === activeAuthor);
      if (optionExists) {
        authorSelect.value = activeAuthor;
      } else {
        searchInput.value = activeAuthor;
        activeSearchQuery = activeAuthor;
        btnClearSearch.classList.remove("hidden");
      }
      fetchQuotes();
      document.querySelector(".explorer-section").scrollIntoView({ behavior: "smooth" });
    }
  });

  // Search input debounced
  searchInput.addEventListener("input", (e) => {
    activeSearchQuery = e.target.value.trim();
    if (activeSearchQuery) {
      btnClearSearch.classList.remove("hidden");
    } else {
      btnClearSearch.classList.add("hidden");
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchQuotes();
    }, 250);
  });

  // Clear search input
  btnClearSearch.addEventListener("click", () => {
    searchInput.value = "";
    activeSearchQuery = "";
    btnClearSearch.classList.add("hidden");
    fetchQuotes();
    searchInput.focus();
  });

  // Category Dropdown Change
  categorySelect.addEventListener("change", (e) => {
    syncCategoryUI(e.target.value);
    fetchQuotes();
  });

  // Category Chips Click
  categoryChipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const cat = chip.dataset.category;
    syncCategoryUI(cat);
    fetchQuotes();
  });

  // Author Dropdown Change
  authorSelect.addEventListener("change", (e) => {
    activeAuthor = e.target.value;
    fetchQuotes();
  });

  // Reset Filters Buttons
  btnResetFilters.addEventListener("click", resetAllFilters);
  btnEmptyReset.addEventListener("click", resetAllFilters);

  // Export to CSV Button
  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", exportToCSV);
  }

  // Quote Grid Interactions (Category tag click & Card copy button)
  quotesGrid.addEventListener("click", (e) => {
    const copyBtn = e.target.closest(".btn-card-copy");
    if (copyBtn) {
      const text = copyBtn.dataset.quote;
      const author = copyBtn.dataset.author;
      copyToClipboard(text, author, copyBtn);
      return;
    }

    const catTag = e.target.closest(".card-category-tag");
    if (catTag) {
      const cat = catTag.dataset.category;
      syncCategoryUI(cat);
      fetchQuotes();
      document.querySelector(".controls-panel").scrollIntoView({ behavior: "smooth" });
    }
  });

  // Keyboard shortcut: Spacebar triggers new quote (when not typing in inputs)
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      fetchRandomQuote(currentSpotlightQuote ? currentSpotlightQuote.id : null);
    }
  });

  // --- Initial Page Load ---
  fetchRandomQuote();
  fetchCategories();
  fetchAuthors();
  fetchQuotes();
});
