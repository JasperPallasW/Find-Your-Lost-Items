// items.js - the Items page: three numbers and a table of all items, with keyword search.
// (This is the old History page, now part of the Items page.)
// The status tabs (All / Lost / Found / Returned) and the category list work with CSS only
// (see style.css, section 6), so this file only builds the table and does the keyword search.

const itemTable = document.getElementById("itemTable");
const searchInput = document.getElementById("searchInput");
const searchNote = document.getElementById("searchNote");

// One table row for one item.
// data-status and data-category are read by the CSS filters; "filter-target" marks the rows they may hide.
function rowHtml(item) {
  return `
    <tr class="filter-target" data-status="${escapeHtml(item.status)}" data-category="${escapeHtml(item.category)}">
      <td><a href="detail.html?id=${item.id}">${escapeHtml(item.name)}</a></td>
      <td>${escapeHtml(item.category)}</td>
      <td><span class="badge ${statusBadgeClass(item.status)}">${capitalize(item.status)}</span></td>
      <td>${escapeHtml(item.location)}</td>
      <td>${formatDate(item.date)}</td>
      <td>${escapeHtml(item.reporterName)}</td>
    </tr>`;
}

// Show a list of items as table rows
function showItems(list) {
  itemTable.innerHTML = "";

  if (list.length === 0) {
    itemTable.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No items found. Try another keyword.</td></tr>';
    return;
  }
  for (let i = 0; i < list.length; i++) {
    itemTable.innerHTML += rowHtml(list[i]);
  }
}

// Return only the items that match the keyword.
// "black wallet" matches an item only if BOTH words are found somewhere in the item.
function searchItems(list, keyword) {
  const words = keyword.toLowerCase().trim().split(" ");
  const result = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    // Put all searchable text of the item in one long text
    const text = (item.name + " " + item.category + " " + item.status + " " +
                  item.location + " " + item.description).toLowerCase();

    let matchAll = true;
    for (let w = 0; w < words.length; w++) {
      if (words[w] !== "" && text.indexOf(words[w]) === -1) {
        matchAll = false;
        break; // one word is missing, no need to check the rest
      }
    }
    if (matchAll) {
      result.push(item);
    }
  }
  return result;
}

// Newest items first
function sortNewestFirst(list) {
  return list.slice().sort(function (a, b) {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    return b.id - a.id;
  });
}

const allItems = sortNewestFirst(getItems());

// The three numbers (they count ALL items)
const counts = countByStatus(allItems);
setText("countLost", counts.lost);
setText("countFound", counts.found);
setText("countReturned", counts.returned);

// Read the search box and show the matching items
function applySearch() {
  const keyword = searchInput.value;
  const found = searchItems(allItems, keyword);
  showItems(found);
  searchNote.textContent = keyword.trim() === "" ? "" : "Items matching your search: " + found.length;
}

searchInput.addEventListener("input", applySearch);

// The home page search box sends the word in the address: items.html?q=wallet
const params = new URLSearchParams(window.location.search);
if (params.get("q") !== null) {
  searchInput.value = params.get("q");
}
applySearch();
