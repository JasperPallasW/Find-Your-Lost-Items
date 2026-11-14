// storage.js - everything about saving and reading data.
// We use localStorage: a small storage inside the browser (instead of a database).
// localStorage can only keep TEXT, so we use:
//   JSON.stringify(list)  = list -> text (before saving)
//   JSON.parse(text)      = text -> list (after reading)

const USERS_KEY = "lf_users";                // all registered accounts
const CURRENT_USER_KEY = "lf_current_user";  // who is logged in now
const ITEMS_KEY = "lf_items";                // all items (seed items + new reports)
const SEED_VERSION_KEY = "lf_seed_version";  // which version of data.js was loaded

const POINTS_PER_RETURN = 10;

// Honor badges. The first one that matches (from top to bottom) is the badge.
const BADGES = [
  { min: 3, name: "Campus Hero",    level: "gold",   icon: "bi-trophy-fill" },
  { min: 2, name: "Campus Helper",  level: "silver", icon: "bi-award-fill" },
  { min: 1, name: "Good Samaritan", level: "bronze", icon: "bi-heart-fill" }
];

// ---------- Basic read / write ----------

// Read a list from localStorage. If nothing is saved (or the text is broken), return "fallback".
function readJson(key, fallback) {
  const saved = localStorage.getItem(key);
  if (saved === null) {
    return fallback;
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Users ----------

function getUsers() {
  return readJson(USERS_KEY, []);
}

function saveUsers(users) {
  writeJson(USERS_KEY, users);
}

// Return the user with this email, or null if there is none
function findUserByEmail(email) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return null;
}

function findUserByStudentId(studentId) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].studentId === studentId) {
      return users[i];
    }
  }
  return null;
}

// Who is logged in now? (user object, or null if nobody)
function getCurrentUser() {
  return readJson(CURRENT_USER_KEY, null);
}

function setCurrentUser(user) {
  writeJson(CURRENT_USER_KEY, user);
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ---------- Items ----------

// Get all items.
// The first time (or when SEED_VERSION in data.js changes), the demo items from
// data.js are copied into localStorage. Items added by users are always kept.
function getItems() {
  let list = readJson(ITEMS_KEY, null);
  const savedVersion = localStorage.getItem(SEED_VERSION_KEY);

  if (list === null || savedVersion !== String(SEED_VERSION)) {
    const userItems = [];
    if (list !== null) {
      for (let i = 0; i < list.length; i++) {
        if (!list[i].isSeed) {
          userItems.push(list[i]);
        }
      }
    }

    const freshSeeds = [];
    for (let i = 0; i < seedItems.length; i++) {
      freshSeeds.push(Object.assign({}, seedItems[i], { isSeed: true }));
    }

    list = freshSeeds.concat(userItems);
    writeJson(ITEMS_KEY, list);
    localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
  }
  return list;
}

function saveItems(list) {
  writeJson(ITEMS_KEY, list);
}

// Find one item by its id (the id from the web address is text, so we compare as text)
function getItemById(id) {
  const list = getItems();
  for (let i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) {
      return list[i];
    }
  }
  return null;
}

// Add a new item to the list and save it
function addItem(item) {
  const list = getItems();
  list.push(item);
  saveItems(list);
}

// Today as text, like "2026-10-15" (local time)
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// ---------- Who is who (finder, owner) ----------
// An item has a REPORTER (who made the report) and, later, a RESPONDER (the other person):
//   found report: finder = reporter, owner = responder (the person who says "this is my item")
//   lost report:  owner = reporter,  finder = responder (the person who says "I found it")

// The finder of an item, or null if there is none yet
function getFinder(item) {
  if (item.reportType === "found") {
    return { id: item.reporterId, name: item.reporterName, origin: item.reporterOrigin, contact: item.contact };
  }
  if (item.responderId) {
    return { id: item.responderId, name: item.responderName, origin: item.responderOrigin, contact: item.responderContact };
  }
  return null;
}

// The owner of an item, or null if there is none yet
function getOwner(item) {
  if (item.reportType === "lost") {
    return { id: item.reporterId, name: item.reporterName, origin: item.reporterOrigin, contact: item.contact };
  }
  if (item.responderId) {
    return { id: item.responderId, name: item.responderName, origin: item.responderOrigin, contact: item.responderContact };
  }
  return null;
}

// What may this user do with this item? (user = the logged in user, or null)
// The detail page uses these answers to decide which buttons to show.
function getItemActions(item, user) {
  const userId = user === null ? "" : String(user.id);
  const isOpen = item.status !== "returned";
  const hasResponse = Boolean(item.responderId);
  const isReporter = userId !== "" && userId === item.reporterId;
  const isResponder = userId !== "" && userId === item.responderId;
  const owner = getOwner(item);

  return {
    isReporter: isReporter,
    isResponder: isResponder,
    hasResponse: hasResponse,
    // someone else answers the report ("This is my item" / "I found this item")
    canRespond: user !== null && isOpen && !hasResponse && !isReporter,
    // the reporter can reject a wrong answer, the responder can cancel his own answer
    canReject: isOpen && hasResponse && isReporter,
    canCancel: isOpen && hasResponse && isResponder,
    // ONLY the owner can confirm that the item came back
    canConfirm: isOpen && hasResponse && owner !== null && userId !== "" && userId === owner.id
  };
}

// Step 1: another person answers the report. Returns { ok, message }.
function respondToItem(id, user, note) {
  const item = getItemById(id);
  if (item === null || user === null) {
    return { ok: false, message: "Item or user not found." };
  }
  if (!getItemActions(item, user).canRespond) {
    return { ok: false, message: "You cannot respond to this item." };
  }
  const list = getItems();
  for (let i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) {
      list[i].responderId = String(user.id);
      list[i].responderName = user.fullName;
      list[i].responderOrigin = user.origin;
      list[i].responderContact = user.phone;
      list[i].responderNote = note;
      list[i].responderDate = todayString();
      saveItems(list);
    }
  }
  return { ok: true, message: "Response saved." };
}

// Remove the response (the reporter rejects it, or the responder cancels it)
function clearResponse(id, user) {
  const item = getItemById(id);
  if (item === null || user === null) {
    return { ok: false, message: "Item or user not found." };
  }
  const actions = getItemActions(item, user);
  if (!actions.canReject && !actions.canCancel) {
    return { ok: false, message: "You cannot remove this response." };
  }
  const list = getItems();
  for (let i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) {
      list[i].responderId = "";
      list[i].responderName = "";
      list[i].responderOrigin = "";
      list[i].responderContact = "";
      list[i].responderNote = "";
      list[i].responderDate = "";
      saveItems(list);
    }
  }
  return { ok: true, message: "Response removed." };
}

// Step 2: the OWNER confirms that the item came back, and may leave feedback.
// Only after this the status becomes "returned" (and the finder gets points).
function confirmReturned(id, user, feedback) {
  const item = getItemById(id);
  if (item === null || user === null) {
    return { ok: false, message: "Item or user not found." };
  }
  if (!getItemActions(item, user).canConfirm) {
    return { ok: false, message: "Only the owner can confirm that the item was returned." };
  }
  const list = getItems();
  for (let i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) {
      list[i].status = "returned";
      list[i].returnedDate = todayString();
      list[i].returnedNote = feedback;
      saveItems(list);
    }
  }
  return { ok: true, message: "Thank you! The item is now marked as returned." };
}

// ---------- Statistics and Finder Heroes ----------

// Count items by status. Example result: { lost: 4, found: 3, returned: 6 }
function countByStatus(list) {
  const counts = { lost: 0, found: 0, returned: 0 };
  for (let i = 0; i < list.length; i++) {
    if (counts[list[i].status] !== undefined) {
      counts[list[i].status]++;
    }
  }
  return counts;
}

// Which badge belongs to this number of returned items? (null = no badge yet)
function getBadge(returns) {
  for (let i = 0; i < BADGES.length; i++) {
    if (returns >= BADGES[i].min) {
      return BADGES[i];
    }
  }
  return null;
}

// Build the ranking of finders from a list of items.
// A finder earns 1 return ONLY when the owner confirmed that the item came back
// (status "returned" and a responder exists).
function buildFinderBoard(list) {
  const finders = {};

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.status !== "returned" || !item.responderId) {
      continue; // not confirmed by an owner: no points
    }
    const finder = getFinder(item);
    if (finder === null) {
      continue;
    }
    if (finders[finder.id] === undefined) {
      finders[finder.id] = { id: finder.id, name: finder.name, origin: finder.origin, returns: 0 };
    }
    finders[finder.id].returns++;
  }

  const board = [];
  for (const key in finders) {
    const finder = finders[key];
    finder.points = finder.returns * POINTS_PER_RETURN;
    finder.badge = getBadge(finder.returns);
    board.push(finder);
  }

  // Most returns first. If equal, sort by name.
  board.sort(function (a, b) {
    if (b.returns !== a.returns) {
      return b.returns - a.returns;
    }
    return a.name.localeCompare(b.name);
  });
  return board;
}

function getFinderBoard() {
  return buildFinderBoard(getItems());
}
