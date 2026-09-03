// Google Apps Script Web App URL that appends each submission as a row in
// a Google Sheet. Deploy the script from README.md and paste the URL here.
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz8-ziUxVSlhGAWBBtgQxnTjrPaJKfCtRV329t8aQ3lAYMjiUJ9EgDgz4wJvV-DbpaEMA/exec";

const lookupForm = document.getElementById("lookup-form");
const lookupNameInput = document.getElementById("lookup-name");
const lookupError = document.getElementById("lookup-error");

const disambiguation = document.getElementById("disambiguation");
const disambiguationList = document.getElementById("disambiguation-list");
const disambiguationBack = document.getElementById("disambiguation-back");

const form = document.getElementById("rsvp-form");
const nameField = document.getElementById("name");
const seatsNote = document.getElementById("seats-note");
const guestField = document.getElementById("guest-field");
const guestSelect = document.getElementById("guests");
const confirmation = document.getElementById("confirmation");
const confirmationTitle = document.getElementById("confirmation-title");
const confirmationText = document.getElementById("confirmation-text");
const submitBtn = document.getElementById("submit-btn");

const declineConfirm = document.getElementById("decline-confirm");
const declineConfirmBtn = document.getElementById("decline-confirm-btn");
const declineCancelBtn = document.getElementById("decline-cancel");

let allottedSeats = 1;

// Commits to one guest-list entry and reveals the RSVP form for it. Shared
// by the direct single-match path and the disambiguation picker below.
function selectGuestEntry(entry) {
  allottedSeats = entry.seats;
  nameField.value = entry.name;

  guestSelect.innerHTML = "";
  for (let i = 1; i <= allottedSeats; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = String(i);
    guestSelect.appendChild(option);
  }

  seatsNote.textContent =
    allottedSeats === 1
      ? `We've reserved 1 seat for you, ${entry.name}.`
      : `We've reserved ${allottedSeats} seats for you and your party, ${entry.name}.`;

  lookupForm.hidden = true;
  disambiguation.hidden = true;
  form.hidden = false;
  toggleConditionalFields();
}

function showDisambiguation(entries) {
  disambiguationList.innerHTML = "";
  entries.forEach((entry) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "disambiguation-option";
    const seatsLabel = entry.seats === 1 ? "1 seat" : `${entry.seats} seats`;
    btn.innerHTML = `<span class="disambiguation-name">${entry.name}</span><span class="disambiguation-seats">${seatsLabel}</span>`;
    btn.addEventListener("click", () => selectGuestEntry(entry));
    disambiguationList.appendChild(btn);
  });

  lookupForm.hidden = true;
  disambiguation.hidden = false;
}

disambiguationBack.addEventListener("click", () => {
  disambiguation.hidden = true;
  lookupForm.hidden = false;
  lookupNameInput.focus();
});

lookupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const entries = findGuestEntries(lookupNameInput.value);

  if (entries.length === 0) {
    lookupError.hidden = false;
    return;
  }

  lookupError.hidden = true;

  if (entries.length > 1) {
    showDisambiguation(entries);
    return;
  }

  selectGuestEntry(entries[0]);
});

// Shows the "Number of Guests" picker only when there's an actual choice to
// make (a party with more than one allotted seat) and the guest is coming.
function toggleConditionalFields() {
  const attending = form.querySelector('input[name="attending"]:checked');
  const isYes = attending && attending.value === "yes";
  guestField.classList.toggle("hidden", !isYes || allottedSeats <= 1);
}

form.querySelectorAll('input[name="attending"]').forEach((input) => {
  input.addEventListener("change", toggleConditionalFields);
});

// Pre-select "attending" when arriving via the invitation page's Join /
// Can't Make It buttons (rsvp.html?attending=yes|no), so the choice already
// made there carries through once the guest looks themselves up below.
const preselectAttending = new URLSearchParams(location.search).get("attending");
if (preselectAttending === "yes" || preselectAttending === "no") {
  const radio = form.querySelector(`input[name="attending"][value="${preselectAttending}"]`);
  if (radio) radio.checked = true;
}

toggleConditionalFields();

function saveRsvpLocally(data) {
  const existing = JSON.parse(localStorage.getItem("rsvps") || "[]");
  existing.push(data);
  localStorage.setItem("rsvps", JSON.stringify(existing));
}

// Sends the RSVP to the Google Sheet via the Apps Script webhook. Uses a
// plain-text body so the browser skips the CORS preflight (Apps Script web
// apps don't handle OPTIONS requests). Always resolves — a failed send is
// caught and the guest still sees a confirmation, since the RSVP is also
// kept in localStorage as a fallback record.
async function sendRsvp(data) {
  if (!SHEETS_WEBHOOK_URL) return false;
  try {
    await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
    return true;
  } catch (err) {
    console.error("RSVP webhook failed, kept locally only:", err);
    return false;
  }
}

// Builds the submission payload from the current form state. `attending` is
// passed explicitly rather than re-read from the form, since the decline
// path confirms first (see below) and the yes path submits directly.
function buildRsvpData(attending) {
  const formData = new FormData(form);
  return {
    name: formData.get("name"),
    attending,
    guests: attending === "yes" ? formData.get("guests") || "1" : null,
    allottedSeats,
    message: formData.get("message"),
    submittedAt: new Date().toISOString(),
  };
}

async function submitRsvp(attending) {
  const data = buildRsvpData(attending);

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  saveRsvpLocally(data);
  await sendRsvp(data);

  submitBtn.textContent = "Sent";

  if (attending === "yes") {
    confirmationTitle.textContent = "Thank you!";
    confirmationText.textContent = "Your RSVP has been recorded. We can't wait to celebrate with you.";
  } else {
    confirmationTitle.textContent = "We'll miss you";
    confirmationText.textContent = "Thank you for letting us know — you'll be in our thoughts on the day.";
  }

  form.hidden = true;
  declineConfirm.hidden = true;
  confirmation.hidden = false;
}

declineCancelBtn.addEventListener("click", () => {
  declineConfirm.hidden = true;
  form.hidden = false;
});

declineConfirmBtn.addEventListener("click", () => {
  submitRsvp("no");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const requiredFields = form.querySelectorAll("[required]");
  let valid = true;
  requiredFields.forEach((field) => {
    const wrapper = field.closest(".field") || field.closest("fieldset");
    if (!field.value) {
      valid = false;
      if (wrapper) wrapper.classList.add("error");
    } else if (wrapper) {
      wrapper.classList.remove("error");
    }
  });

  if (!valid) return;

  const attending = new FormData(form).get("attending");

  if (attending === "no") {
    // Don't send yet — ask the guest to confirm they meant to decline first.
    form.hidden = true;
    declineConfirm.hidden = false;
    return;
  }

  submitRsvp("yes");
});
