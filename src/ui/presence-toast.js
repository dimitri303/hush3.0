const CITIES = [
  'London', 'Paris', 'Athens', 'Berlin', 'Tokyo', 'New York', 'Lisbon', 'Seoul',
  'Amsterdam', 'Copenhagen', 'Melbourne', 'Barcelona', 'Rome', 'Stockholm', 'Oslo',
  'Helsinki', 'Reykjavik', 'Dublin', 'Edinburgh', 'Manchester', 'Brighton', 'Bristol',
  'Vienna', 'Prague', 'Warsaw', 'Budapest', 'Zurich', 'Geneva', 'Milan', 'Florence',
  'Madrid', 'Valencia', 'Porto', 'Brussels', 'Antwerp', 'Munich', 'Hamburg', 'Cologne',
  'Istanbul', 'Thessaloniki', 'Nicosia', 'Tel Aviv', 'Cairo', 'Marrakech', 'Cape Town',
  'Nairobi', 'Mumbai', 'Delhi', 'Bangkok', 'Singapore', 'Hong Kong', 'Taipei', 'Kyoto',
  'Osaka', 'Sydney', 'Auckland', 'Toronto', 'Vancouver', 'Montreal', 'Chicago',
  'Los Angeles', 'San Francisco', 'Seattle', 'Portland', 'Mexico City', 'Buenos Aires',
  'São Paulo', 'Santiago',
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function createPresenceToast(getEnabled) {
  const el = document.getElementById('presenceToast');
  if (!el) return;

  let showTimer = null;
  let hideTimer = null;

  function scheduleNext() {
    clearTimeout(showTimer);
    showTimer = setTimeout(trigger, rand(90_000, 180_000));
  }

  function trigger() {
    if (!getEnabled()) {
      scheduleNext();
      return;
    }
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    el.textContent = `a new guest from ${city} joined`;
    el.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      el.classList.remove('show');
      scheduleNext();
    }, 5000);
  }

  // ── VISUAL TEST — remove after confirming toast renders correctly ──────────
  setTimeout(() => {
    el.textContent = 'a new guest from Paris joined';
    el.classList.add('show');
    setTimeout(() => { el.classList.remove('show'); }, 5000);
  }, 2000);
  // ──────────────────────────────────────────────────────────────────────────

  // First real toast fires 45–90 s after load
  showTimer = setTimeout(trigger, rand(45_000, 90_000));
}
