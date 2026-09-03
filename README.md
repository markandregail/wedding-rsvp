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

### 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank sheet.
2. Rename the first tab to `RSVPs`.
3. In row 1, add these headers (one per column, A through F):
   `Submitted At | Name | Attending | Guests | Allotted Seats | Message`

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

That's it — every RSVP submission now appends a row to the Sheet. If you ever change
the questions on the form, update both the `data` object in `rsvp-form.js` and the
`appendRow` order in the script so columns stay aligned.

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
