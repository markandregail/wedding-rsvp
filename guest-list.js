// Each entry is one PARTY, not one person — `seats` is the total number
// reserved for that party. For a couple sharing seats, add one entry (not
// two) with the combined seat count, and list each partner's own name under
// `aliases` so either of them can look themselves up and land on the same
// shared allotment. `name` is what's shown back to them ("We've reserved
// seats for you and your party, <name>.") and what's recorded on submission.
const GUEST_LIST = [
  { name: "Rogelio & Janelyn Nigos", aliases: ["Rogelio Nigos", "Janelyn Nigos", "janelyn", "rogelio"], seats: 2 },
  { name: "Odessey Karl Nigos", aliases: ["karlo"], seats: 2 },
  { name: "Rhojn Darel Nigos", aliases: ["rj"], seats: 2 },
  { name: "Ron Navalta Nigos", aliases: ["tita ron", "ron"], seats: 1 },
  { name: "Jerico & Lonilyn Faye Flores", aliases: ["eco", "faye", "Jerico", "Jerico flores", "Lonilyn Faye Flores"], seats: 2 },
  { name: "Arvin & April Mayor", aliases: ["arvin", "Arvin Mayor", "april", "April Mayor"], seats: 2 },
  { name: "Katrin Jose", aliases: ["kat"], seats: 1 },
  { name: "Jose & Hazel Jose", aliases: ["kaps", "Jose Jose Jr.", "hazel", "Hazel Jose", "jose"], seats: 2 },
  { name: "Guia Marie Cadavillo", aliases: ["Guia", "marie"], seats: 1 },
  { name: "Gaychelle Anne Marie Cadavillo", aliases: ["Gaychelle", "anne", "marie"], seats: 1 },
  { name: "Christian Cadavillo", aliases: ["Christian"], seats: 1 },
  { name: "Cherry Nadal", aliases: ["tita cherry", "cherry"], seats: 1 },
  { name: "Lyn De Leon", aliases: ["tita lyn", "lyn"], seats: 1 },
  { name: "Jesse De Leon", aliases: ["lolo jesse", "jesse"], seats: 1 },
  { name: "Kimberly Cadiz", aliases: ["kim", "Kimberly"], seats: 1 },
  { name: "Mikaela Lopez & Ivan Baduria", aliases: ["mika", "Mikaela", "ivan"], seats: 2 },
  { name: "Wesley & Hannah Chan", aliases: ["wes", "hannah", "chan", "chinito", "hanna"], seats: 2 },
  { name: "Miko & Uly-Ann Ramoran", aliases: ["miko", "uly", "Ramoran"], seats: 2 },
  { name: "Kwinie Dalapag", aliases: ["kwinie"], seats: 1 },
];

function normalizeName(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

// Returns every entry whose name or alias matches — usually one, but a
// nickname reused across guests (e.g. two people both aliased "Alex") can
// match more than one. Callers should ask the guest to pick when there's
// more than one match rather than silently guessing.
function findGuestEntries(name) {
  const target = normalizeName(name);
  return GUEST_LIST.filter((entry) => {
    if (normalizeName(entry.name) === target) return true;
    return (entry.aliases || []).some((alias) => normalizeName(alias) === target);
  });
}

function findGuestEntry(name) {
  return findGuestEntries(name)[0] || null;
}
