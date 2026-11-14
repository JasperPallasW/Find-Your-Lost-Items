// detail.js - the detail page of one item.
// The item is chosen by the address: detail.html?id=3
//
// THE RULE: the finder gets points and a badge ONLY after the OWNER confirms
// that the item came back. The steps on this page are:
//   1) a second person responds:  "This is my item" (found report) or "I found this item" (lost report)
//   2) they meet and hand over the item
//   3) the OWNER presses "I received my item" and may leave feedback -> status "returned"

const params = new URLSearchParams(window.location.search);
const item = getItemById(params.get("id"));
const user = getCurrentUser();

if (item === null) {
  // Wrong or missing id
  document.getElementById("detailRoot").classList.add("d-none");
  document.getElementById("notFound").classList.remove("d-none");
} else {
  showItemDetails();
}

function showItemDetails() {
  document.title = item.name + " - Find Your Lost Items";

  const image = document.getElementById("detailImage");
  image.src = imageSrc(item.image);
  image.alt = item.name;

  setText("detailName", item.name);
  const status = document.getElementById("detailStatus");
  status.textContent = capitalize(item.status);
  status.className = "badge fs-6 " + statusBadgeClass(item.status);

  setText("detailDescription", item.description);
  setText("detailCategory", item.category);
  setText("detailLocation", item.location);
  setText("detailDate", formatDate(item.date));

  // Who reported it?
  const whoLabel = item.reportType === "found" ? "Found by " : "Reported by ";
  document.getElementById("detailReporter").innerHTML =
    '<i class="bi bi-person-fill"></i> ' + whoLabel + "<strong>" + escapeHtml(item.reporterName) + "</strong>" +
    ' <span class="text-muted">(' + escapeHtml(item.reporterOrigin) + ")</span>";

  showFinderBadge();
  showContactButton();
  showReturnedInfo();
  if (item.status !== "returned") {
    showHiddenDetail();
    showResponseArea();
  }
}

// Honor badge of the finder (the finder is found with getFinder)
function showFinderBadge() {
  const finder = getFinder(item);
  if (finder === null) {
    return;
  }
  const board = getFinderBoard();
  for (let i = 0; i < board.length; i++) {
    if (board[i].id === finder.id) {
      document.getElementById("finderBox").innerHTML =
        badgeHtml(board[i].badge) + ' <span class="small text-muted">' + board[i].returns + " item(s) returned</span>";
    }
  }
}

// WhatsApp link to the reporter (plain HTML link, no JavaScript needed to open it)
function showContactButton() {
  if (item.status === "returned") {
    return; // nothing to contact about anymore
  }
  if (user === null) {
    // Only logged in students can contact (more safety for personal data)
    document.getElementById("loginToContact").classList.remove("d-none");
    return;
  }
  if (String(user.id) === item.reporterId) {
    return; // this is your own report, no need to contact yourself
  }
  const message = "Hi, I saw your " + item.reportType + " post for '" + item.name +
                  "' on Find Your Lost Items.";
  const button = document.getElementById("whatsappBtn");
  button.href = "https://wa.me/" + item.contact + "?text=" + encodeURIComponent(message);
  button.classList.remove("d-none");
}

// The hidden detail is written by the finder of a FOUND item.
// Only that finder can see it (to check the answer of the person who claims the item).
function showHiddenDetail() {
  const actions = getItemActions(item, user);
  if (item.reportType === "found" && actions.isReporter && item.secret) {
    setText("hiddenDetailText", item.secret);
    document.getElementById("hiddenDetailBox").classList.remove("d-none");
  }
}

// Responses and confirmation (steps 1 to 3)
function showResponseArea() {
  const actions = getItemActions(item, user);
  const isFound = item.reportType === "found";

  // Step 1: a second person can respond
  if (actions.canRespond) {
    document.getElementById("respondPanel").classList.remove("d-none");
    if (isFound) {
      setText("respondSummary", "This is my item");
      setText("respondNoteLabel", "Describe a detail only the owner knows (the finder will check it)");
    } else {
      setText("respondSummary", "I found this item");
      setText("respondNoteLabel", "Where did you find it? Write a short message for the owner");
    }
    document.getElementById("respondForm").addEventListener("submit", function (event) {
      event.preventDefault();
      respondToItem(item.id, user, document.getElementById("respondNote").value.trim());
      window.location.reload();
    });
  }

  // A response is waiting
  if (actions.hasResponse) {
    showResponseBox(actions, isFound);
  }

  // Step 3: ONLY the owner can confirm
  if (actions.canConfirm) {
    document.getElementById("confirmPanel").classList.remove("d-none");
    document.getElementById("confirmForm").addEventListener("submit", function (event) {
      event.preventDefault();
      confirmReturned(item.id, user, document.getElementById("confirmFeedback").value.trim());
      window.location.reload();
    });
  }
}

// The box that shows the waiting response (different text for each person)
function showResponseBox(actions, isFound) {
  document.getElementById("responseBox").classList.remove("d-none");

  if (!actions.isReporter && !actions.isResponder) {
    setText("responseTitle", "Waiting for the owner");
    setText("responseInfo", "Someone already responded to this item. The owner has to confirm when the item is received.");
    return;
  }

  if (actions.isReporter) {
    setText("responseTitle", isFound ? "Someone says this is their item" : "Someone says they found your item");
    setText("responseInfo", item.responderName + " (" + item.responderOrigin + ") responded on " +
            formatDate(item.responderDate) + ".");
    document.getElementById("responseNote").innerHTML =
      '<i class="bi bi-chat-quote-fill"></i> &ldquo;' + escapeHtml(item.responderNote) + "&rdquo;";

    const link = document.getElementById("whatsappResponder");
    link.href = "https://wa.me/" + item.responderContact + "?text=" +
                encodeURIComponent("Hi, I am the person who posted '" + item.name + "' on Find Your Lost Items.");
    link.classList.remove("d-none");

    const reject = document.getElementById("rejectBtn");
    reject.classList.remove("d-none");
    reject.addEventListener("click", function () {
      if (window.confirm("Remove this response? The other person can try again later.")) {
        clearResponse(item.id, user);
        window.location.reload();
      }
    });
  } else {
    setText("responseTitle", isFound ? "You said this is your item" : "You said you found this item");
    setText("responseInfo", "Meet the other person and hand over the item. The OWNER confirms when the item is received.");

    const cancel = document.getElementById("cancelBtn");
    cancel.classList.remove("d-none");
    cancel.addEventListener("click", function () {
      if (window.confirm("Cancel your response?")) {
        clearResponse(item.id, user);
        window.location.reload();
      }
    });
  }
}

// If the item was returned: when, to whom, who found it, and the feedback of the owner
function showReturnedInfo() {
  if (item.status !== "returned") {
    return;
  }
  document.getElementById("returnedBox").classList.remove("d-none");

  const owner = getOwner(item);
  const finder = getFinder(item);

  setText("returnedInfo", (owner ? "Returned to " + owner.name : "Returned") + " on " + formatDate(item.returnedDate) + ".");
  if (finder !== null) {
    setText("returnedFinder", "Found by " + finder.name + " (" + finder.origin + "). The owner confirmed the return.");
  }

  if (item.returnedNote) {
    document.getElementById("returnedNoteText").innerHTML =
      '<i class="bi bi-chat-heart-fill"></i> &ldquo;' + escapeHtml(item.returnedNote) + "&rdquo;";
  }
}
