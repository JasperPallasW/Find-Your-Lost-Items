// contact.js - the message form on the Contact Us page.
// On Netlify the message is sent with "Netlify Forms" (the form has data-netlify="true").
// When sending is not possible (for example when the page is opened as a file on your
// computer), a copy of the message is saved in this browser (localStorage) instead.

const contactForm = document.getElementById("contactForm");

// If someone is logged in, fill in the name and e-mail for them
const contactUser = getCurrentUser();
if (contactUser !== null) {
  document.getElementById("contactName").value = contactUser.fullName;
  document.getElementById("contactEmail").value = contactUser.email;
}

// Keep a copy of the message in this browser
function saveMessageLocally(data) {
  const list = readJson("lf_messages", []);
  list.push({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    date: new Date().toISOString()
  });
  writeJson("lf_messages", list);
}

contactForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const formData = new FormData(contactForm);
  const data = {
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
    subject: String(formData.get("subject")).trim(),
    message: String(formData.get("message")).trim()
  };

  // Send the form to the website itself ("/"): this is how Netlify Forms receives it
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString()
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("The message was not accepted.");
      }
      showMessage("Thank you, " + data.name + "! Your message was sent. We will answer by e-mail.", "success");
      contactForm.reset();
    })
    .catch(function () {
      saveMessageLocally(data);
      showMessage("Your message could not be sent online (this happens when the website is opened as a file). " +
                  "A copy was saved in this browser. You can also write to us by e-mail.", "warning");
      contactForm.reset();
    });
});
