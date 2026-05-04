const ENTRIES_KEY = 'hush_guestbook_entries';
const LAST_SIGNED_KEY = 'hush_guestbook_last_signed_at';
const MAX_ENTRIES = 30;
const MAX_DISPLAY = 5;

const PRESET_MESSAGES = [
  'quiet night tonight',
  'working late',
  'just listening',
  "can't sleep",
  'taking a break',
  'this room feels calm',
  'passing through',
  'rain sounds good tonight',
  'needed somewhere quiet',
  'leaving a little note',
  'first night at Hush',
];

function makeSeedTimestamp(daysAgo, hour, minute) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const SEED_DATA = [
  { name: 'Elena',  city: 'Athens',   country: 'Greece',        message: 'quiet night tonight',      daysAgo: 1, h: 23, m: 14 },
  { name: 'Marc',   city: 'Paris',    country: 'France',         message: 'just listening',           daysAgo: 2, h: 22, m: 40 },
  { name: 'Hana',   city: 'Tokyo',    country: 'Japan',          message: 'rain sounds good tonight', daysAgo: 2, h:  1, m: 22 },
  { name: 'Sam',    city: 'London',   country: 'United Kingdom', message: 'working late',             daysAgo: 3, h: 23, m: 55 },
  { name: 'Noor',   city: 'Berlin',   country: 'Germany',        message: 'needed somewhere quiet',   daysAgo: 4, h: 22, m: 30 },
  { name: 'Theo',   city: 'Brighton', country: 'United Kingdom', message: 'passing through',          daysAgo: 5, h: 21, m: 15 },
  { name: 'Mira',   city: 'Lisbon',   country: 'Portugal',       message: 'this room feels calm',     daysAgo: 6, h: 23, m: 45 },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function loadEntries() {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {}
}

export function seedGuestbookEntriesIfEmpty() {
  if (loadEntries().length > 0) return;
  saveEntries(SEED_DATA.map(s => ({
    id: generateId(),
    name: s.name,
    city: s.city,
    country: s.country,
    message: s.message,
    createdAt: makeSeedTimestamp(s.daysAgo, s.h, s.m),
    isSeed: true,
  })));
}

export function canSignToday() {
  const last = localStorage.getItem(LAST_SIGNED_KEY);
  if (!last) return true;
  return (Date.now() - new Date(last).getTime()) > 86400000;
}

export function sanitiseGuestbookValue(value, maxLen) {
  if (!value || typeof value !== 'string') return '';
  value = value.trim().slice(0, maxLen);
  if (!value) return '';
  if (/https?:\/\//i.test(value) || /www\./i.test(value)) return '';
  if (/[!?,;:.]{5,}/.test(value)) return '';
  if (!/[\p{L}\p{N}]/u.test(value)) return '';
  return value;
}

export function saveEntry(entry) {
  const entries = loadEntries();
  entries.unshift(entry);
  saveEntries(entries);
  try {
    localStorage.setItem(LAST_SIGNED_KEY, new Date().toISOString());
  } catch {}
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function renderEntries(container) {
  const entries = loadEntries();
  container.textContent = '';
  if (entries.length === 0) {
    const p = document.createElement('p');
    p.className = 'gb-empty';
    p.textContent = 'No guests have signed the book yet.';
    container.appendChild(p);
    return;
  }
  entries.slice(0, MAX_DISPLAY).forEach((entry, idx) => {
    const div = document.createElement('div');
    div.className = idx === 0 ? 'gb-entry gb-entry-new' : 'gb-entry';

    const name = document.createElement('div');
    name.className = 'gb-name';
    name.textContent = entry.name;

    const loc = document.createElement('div');
    loc.className = 'gb-loc';
    loc.textContent = (entry.city || entry.country)
      ? [entry.city, entry.country].filter(Boolean).join(', ')
      : 'somewhere';

    const msg = document.createElement('div');
    msg.className = 'gb-msg';
    msg.textContent = `"${entry.message}"`;

    const date = document.createElement('div');
    date.className = 'gb-date';
    date.textContent = formatDate(entry.createdAt);

    div.append(name, loc, msg, date);
    container.appendChild(div);
  });
}

function renderLastSigned(el) {
  const entries = loadEntries();
  if (entries.length < 2) { el.textContent = ''; return; }
  const cities = [...new Set(entries.slice(0, 3).map(e => e.city).filter(Boolean))];
  el.textContent = cities.length ? `last signed by guests from ${cities.join(', ')}` : '';
}

export function renderSignState(formEl, statusEl) {
  if (!canSignToday()) {
    formEl.style.display = 'none';
    statusEl.textContent = "You've already signed the guestbook today. Come back tomorrow.";
    statusEl.className = 'gb-status gb-status-info';
    return;
  }
  formEl.style.display = '';
  statusEl.textContent = '';
  statusEl.className = 'gb-status';
}

// ── Internal modal state ─────────────────────────────
let _attached = false;

function getEl(id) { return document.getElementById(id); }

function buildMsgPicker() {
  const container = getEl('gbMsgPicker');
  if (!container || container.childNodes.length) return;
  PRESET_MESSAGES.forEach(msg => {
    const label = document.createElement('label');
    label.className = 'gb-msg-chip';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'gbMsg';
    input.value = msg;
    const span = document.createElement('span');
    span.textContent = msg;
    label.append(input, span);
    container.appendChild(label);
  });
}

function switchTab(tab) {
  document.querySelectorAll('.gb-tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const readPane = getEl('gbReadPane');
  const signPane = getEl('gbSignPane');
  if (tab === 'read') {
    readPane.style.display = '';
    signPane.style.display = 'none';
    renderEntries(getEl('gbEntries'));
    renderLastSigned(getEl('gbLastSigned'));
  } else {
    readPane.style.display = 'none';
    signPane.style.display = '';
    renderSignState(getEl('gbForm'), getEl('gbStatus'));
  }
}

function handleSubmit(e) {
  e.preventDefault();
  if (!canSignToday()) return;
  const statusEl = getEl('gbStatus');
  const selectedMsg = document.querySelector('#gbMsgPicker input[name=gbMsg]:checked')?.value || '';
  if (!selectedMsg) {
    statusEl.textContent = 'Please choose a message.';
    statusEl.className = 'gb-status gb-status-error';
    return;
  }
  const name    = sanitiseGuestbookValue(getEl('gbName')?.value    || '', 24) || 'anonymous guest';
  const city    = sanitiseGuestbookValue(getEl('gbCity')?.value    || '', 40);
  const country = sanitiseGuestbookValue(getEl('gbCountry')?.value || '', 40);
  saveEntry({ id: generateId(), name, city, country, message: selectedMsg, createdAt: new Date().toISOString(), isSeed: false });
  statusEl.textContent = 'your note has been added to the book';
  statusEl.className = 'gb-status gb-status-ok';
  setTimeout(() => switchTab('read'), 1200);
}

function attachListeners() {
  if (_attached) return;
  _attached = true;
  buildMsgPicker();
  getEl('gbClose').addEventListener('click', closeGuestbook);
  getEl('guestbookModal').addEventListener('click', e => { if (e.target === getEl('guestbookModal')) closeGuestbook(); });
  getEl('gbForm').addEventListener('submit', handleSubmit);
  document.querySelectorAll('.gb-tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && getEl('guestbookModal')?.classList.contains('open')) closeGuestbook();
  });
}

export function initGuestbook() {
  seedGuestbookEntriesIfEmpty();
}

export function openGuestbook() {
  attachListeners();
  const modal = getEl('guestbookModal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  switchTab('read');
}

export function closeGuestbook() {
  const modal = getEl('guestbookModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}
