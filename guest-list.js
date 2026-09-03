// The guest list itself (real names, nicknames, seat counts) lives only in
// the "GuestList" tab of the Google Sheet — never in this file. This just
// calls the same Apps Script webhook used for RSVP submissions and asks it
// to look a name up, so the browser only ever receives whichever entry (or
// entries) matched what was typed, not the full list. See README.md
// ("Guest list lookup") for the Sheet/Apps Script setup this depends on.
//
// `SHEETS_WEBHOOK_URL` is declared in rsvp-form.js. Both scripts are plain
// classic <script> tags sharing one global scope, and this function isn't
// called until a guest actually submits the lookup form — by then both
// scripts have already run, so the constant is available regardless of
// script order.

// Returns every entry whose name or alias matches — usually one, but a
// nickname reused across guests (e.g. two people both aliased "Alex") can
// match more than one. Callers should ask the guest to pick when there's
// more than one match rather than silently guessing.
async function findGuestEntries(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return [];

  if (!SHEETS_WEBHOOK_URL) {
    console.error("SHEETS_WEBHOOK_URL isn't set — can't look up guests.");
    return [];
  }

  const url = `${SHEETS_WEBHOOK_URL}?action=lookup&name=${encodeURIComponent(trimmed)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return Array.isArray(data.matches) ? data.matches : [];
  } catch (err) {
    console.error("Guest lookup failed:", err);
    return [];
  }
}
