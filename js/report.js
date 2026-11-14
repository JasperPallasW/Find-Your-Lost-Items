// report.js - the Report page: save a new lost / found item.
// Only logged in users can report (we need to know who reported it).

const reportForm = document.getElementById("reportForm");
const loginNotice = document.getElementById("loginNotice");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const currentUser = getCurrentUser();

let photoData = ""; // the photo as text (or "" when there is no photo)

const locationSelect = document.getElementById("location");
const otherLocation = document.getElementById("otherLocation");

if (currentUser === null) {
  // Not logged in: hide the form and show a notice
  reportForm.classList.add("d-none");
  loginNotice.classList.remove("d-none");
} else {
  document.getElementById("date").value = todayString(); // default date = today
}

// Make the photo smaller (max 600 px) so it fits in localStorage.
// FileReader reads the file, <canvas> draws it smaller, toDataURL turns it into text.
function resizePhoto(file, whenDone) {
  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      const maxSize = 600;
      let width = img.width;
      let height = img.height;
      if (width > height && width > maxSize) {
        height = Math.round(height * maxSize / width);
        width = maxSize;
      } else if (height >= width && height > maxSize) {
        width = Math.round(width * maxSize / height);
        height = maxSize;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      whenDone(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (!file) {
    photoData = "";
    photoPreview.classList.add("d-none");
    return;
  }
  resizePhoto(file, function (dataUrl) {
    photoData = dataUrl;
    photoPreview.src = dataUrl;
    photoPreview.classList.remove("d-none");
  });
});

reportForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const typeRadio = document.querySelector('input[name="reportType"]:checked');
  const reportType = typeRadio.value; // "lost" or "found"

  // The photo is required. It is read and made smaller by the browser, which can take a moment.
  if (photoData === "") {
    showMessage("Please choose a photo of the item and wait until the preview appears.", "danger");
    return;
  }

  // "Other": the reporter types the name of the location
  let place = locationSelect.value;
  if (place === "Other") {
    place = otherLocation.value.trim();
    if (place.length < 2) {
      showMessage("Please type the name of the location.", "danger");
      return;
    }
  }

  const isFound = reportType === "found";

  const newItem = {
    id: Date.now(),
    name: document.getElementById("itemName").value.trim(),
    category: document.getElementById("category").value,
    reportType: reportType,
    status: reportType,
    description: document.getElementById("description").value.trim(),
    location: place,
    date: document.getElementById("date").value,
    image: photoData,
    reporterId: String(currentUser.id),
    reporterName: currentUser.fullName,
    reporterOrigin: currentUser.origin,
    contact: currentUser.phone,   // WhatsApp number: the owner and the finder contact each other with it
    // The hidden detail only exists for FOUND items (the field is hidden for lost items)
    secret: isFound ? document.getElementById("secret").value.trim() : "",
    // The other person (owner or finder) is added later, when he or she responds
    responderId: "",
    responderName: "",
    responderOrigin: "",
    responderContact: "",
    responderNote: "",
    responderDate: "",
    returnedDate: "",
    returnedNote: ""
  };

  try {
    addItem(newItem);
  } catch (error) {
    showMessage("Could not save the report (the browser storage is full). Try a smaller photo.", "danger");
    return;
  }

  showMessage("Report saved! Opening your item...", "success");
  setTimeout(function () {
    window.location.href = "detail.html?id=" + newItem.id;
  }, 1000);
});
