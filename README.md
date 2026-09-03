# Wedding RSVP site

A static site (no build step) for the wedding invitation and RSVP flow.

- `index.html` — envelope splash animation plus the invitation, countdown, and details, all on one page
- `rsvp.html` — the RSVP form
- `styles.css` — all styling (theme tokens live at the top in `:root`)
- `countdown.js`, `envelope.js`, `transition.js`, `guest-list.js`, `rsvp-form.js` — page behavior

## Collecting RSVP responses in Google Sheets

Responses are sent to a Google Sheet through a small Apps Script "web app" acting as
a webhook. Each submission is also cached in the guest's browser `localStorage` as a
fallback if the network request fails.

The same Apps Script also serves guest lookups (see "Guest list lookup" below) — the
full guest list (real names, nicknames, seat counts) lives only in the Sheet, never in
a file shipped to the browser. `guest-list.js` just calls this webhook and gets back
whichever entry matched what was typed, nothing more.

### 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank sheet.
2. Rename the first tab to `RSVPs`.
3. In row 1, add these headers (one per column, A through F):
   `Submitted At | Name | Attending | Guests | Allotted Seats | Message`
4. Add a second tab named `GuestList`. In row 1, add these headers:
   `Name | Aliases | Seats`
   - `Name` is the party's display name (what's shown back to them and recorded on
     submission).
   - `Aliases` is a comma-separated list of any other names/nicknames that should
     resolve to this same party (leave blank if none).
   - `Seats` is the total number of seats reserved for that party.

### 2. Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any starter code and paste in the script below.
3. Save the project (name it e.g. "RSVP Webhook").

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs");
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || "",
    data.attending || "",
    data.guests || "",
    data.allottedSeats || "",
    data.message || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Guest lookup — called as a GET request (?action=lookup&name=...) so the
// browser never receives the full guest list, only whatever matches.
function doGet(e) {
  if (e.parameter.action === "lookup") {
    return lookupGuest(e.parameter.name || "");
  }
  return ContentService
    .createTextOutput(JSON.stringify({ error: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function lookupGuest(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("GuestList");
  const rows = sheet.getDataRange().getValues();
  const target = normalizeName(name);
  const matches = [];

  for (let i = 1; i < rows.length; i += 1) {
    const [rowName, aliasesRaw, seats] = rows[i];
    const aliases = String(aliasesRaw || "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const isMatch =
      normalizeName(rowName) === target ||
      aliases.some((alias) => normalizeName(alias) === target);
    if (isMatch) {
      matches.push({ name: rowName, seats: Number(seats) || 1 });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ matches }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set **Execute as**: `Me`. Set **Who has access**: `Anyone`.
4. Click **Deploy**, authorize the script when prompted (it only needs access to this
   one Sheet), and copy the **Web app URL** it gives you — it looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

### 4. Wire it into the site

Paste that URL into `rsvp-form.js`:

```js
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

That's it — every RSVP submission now appends a row to the `RSVPs` tab, and every
guest-lookup query is answered from the `GuestList` tab. If you ever change the
questions on the form, update both the `data` object in `rsvp-form.js` and the
`appendRow` order in the script so columns stay aligned. To add, remove, or fix a
guest, just edit rows in the `GuestList` tab directly — no code changes needed.

### Redeploying after script edits

Apps Script web app URLs stay stable across edits **only if** you use
**Deploy → Manage deployments → Edit (pencil) → New version** rather than creating a
brand new deployment — a new deployment gets a new URL.

## Hosting on GitHub Pages

1. Push this project to a GitHub repository.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch
   `main`, folder `/ (root)`.
4. Save — GitHub publishes the site at `https://<username>.github.io/<repo>/` within a
   minute or two.

No build step is needed since this is plain HTML/CSS/JS.
