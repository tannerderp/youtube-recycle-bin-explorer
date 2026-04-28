document.getElementById("random-search").addEventListener("click", randomSearch);

// ── Helpers ──────────────────────────────────────────────────────────────

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 'pads' a number by converting it to a string and adding leading zeros until it reaches the specified number of digits. For example, `pad(42, 5)` would return `"00042"`.
 */
function pad(num, digits) {
    return String(num).padStart(digits, '0');
}

function randomDate() {
    const start = new Date(2005, 0, 1).getTime();
    const end   = Date.now();
    const d     = new Date(start + Math.random() * (end - start));
    const yyyy  = d.getFullYear();
    const mm    = pad(d.getMonth() + 1, 2);
    const dd    = pad(d.getDate(), 2);
    return `${yyyy}${mm}${dd}`;
}

/**
 * Helper function to open a URL in a new browser tab and focus on it.
 */
function openInNewTab(url) {
  const newTab = window.open(url, '_blank');
  if (newTab) {
    newTab.focus();
  }
}

/**
 * Resolves a template query string by replacing variables according to their specifications, such as random numbers and dates.
 * 
 * @param {*} entry - An object with a `template` string and a `vars` object that defines how to replace variables in the template.
 * @returns result - The template query string to search for, with all variables replaced according to their specifications.
 */
function resolveTemplate(entry) {
    let result = entry.template;

    for (const [key, spec] of Object.entries(entry.vars)) {
    let value;

    if (spec.type === 'random-number') {
        const min    = spec.min    ?? 0;
        const max    = spec.max    ?? 9999;
        const digits = spec.digits ?? null;
        const n      = randomInt(min, max);
        value = digits !== null ? pad(n, digits) : String(n);

    } else if (spec.type === 'yyyymmdd-date') {
        value = randomDate();
    }

    result = result.replace(key, value);
    }

    return result;
}

/**
 * Performs a random search by selecting a random category and template from the provided JSON data, resolving the template with random variables, and opening the search results in a new tab.
 */
async function randomSearch() {
    const btn        = document.getElementById('random-search');
    const statusText = document.getElementById('status-text');

    btn.disabled = true;
    statusText.textContent = 'Rummaging…';

    try {
    // Fetch the JSON (works when served from a local/web server)
    const res  = await fetch('./video-types.json');
    const data = await res.json();

    // Pick a random category, use the selected one or pick randomly
    const categories = Object.values(data);
    let category = null;
    const selected   = document.getElementById('categorySelect').value;
    if (selected === "any"){
        const categoryIndex = randomInt(0, categories.length - 1);
        category   = categories[categoryIndex];
        const categoryName = Object.keys(data)[categoryIndex];
        console.log(`Selected category: ${categoryName}`);
    } else{
        const categoryIndex = Object.keys(data).indexOf(selected);
        category   = categories[categoryIndex];
        console.log(`Selected category: ${selected}`);
    }

    // Pick a random template from that category
    const entry  = category[randomInt(0, category.length - 1)];
    const query  = resolveTemplate(entry);

    statusText.textContent = `Searching: "${query}"`;

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    openInNewTab(url);

    } catch (err) {
    console.error(err);
    statusText.textContent = 'Error loading patterns — are files served together?';
    } finally {
    btn.disabled = false;
    }
}
