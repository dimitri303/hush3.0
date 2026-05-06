// ── CITY CLARITY ──────────────────────────────────────────────────────────────
// Modulates per-layer atmosphere intensity based on window open/close state.
// CLOSED window: full cinematic atmosphere (closedSoftness = 1.0 = no change).
// OPEN window:   reduces haze, fog, reflections and bloom over the skyline.
// The contrast punch (drawSkylineClarityPass) adds a very subtle centre boost
// when open — overlay blend, hard-capped so it never looks crunchy.

const LS_CLARITY = 'hush_cityclarity';

const _DEFAULTS = {
  enabled:               true,
  clarityAmount:         1.00,   // global scale; user dials this to taste (0=off)
  closedSoftness:        1.00,   // atm multiplier when fully closed (1 = keep current)
  openClarityBoost:      0.65,   // lerp t at full open
  hazeAmount:            0.55,   // residual haze fraction when fully open
  reflectionAmount:      0.45,   // residual reflection fraction when fully open
  bloomSoftness:         0.60,   // residual depth-bloom fraction when fully open
  sharpenIntensity:      0.20,   // contrast punch strength (overlay pass)
  billboardClarityBoost: 0.40,   // future: reserved for per-quad billboard boost
  preserveBillboards:    true,   // when true, glass shimmer reduced 30% extra over quads
  showInfluence:         false,  // debug: tint overlay showing atmosphere distribution
};

export const cityClaritySettings = { ..._DEFAULTS };

// ── Persistence ───────────────────────────────────────────────────────────────

export function saveClaritySettings() {
  try { localStorage.setItem(LS_CLARITY, JSON.stringify(cityClaritySettings)); } catch (_) {}
}

export function resetClaritySettings() {
  Object.assign(cityClaritySettings, _DEFAULTS);
  try { localStorage.removeItem(LS_CLARITY); } catch (_) {}
}

// Auto-load on import
try {
  const raw = localStorage.getItem(LS_CLARITY);
  if (raw) Object.assign(cityClaritySettings, JSON.parse(raw));
} catch (_) {}

// ── Multiplier maths ──────────────────────────────────────────────────────────
// All return values in [0, closedSoftness]. Value = closedSoftness when closed.
// lerp toward (closedSoftness × residual) as window opens.

function _openF(winAnim) {
  const s = cityClaritySettings;
  return Math.min(winAnim * s.clarityAmount * s.openClarityBoost, 1);
}

// Haze + fog layers (drawCityTimeAtmosphere, drawFogBanks) — wrap in globalAlpha
export function getAtmMult(winAnim) {
  if (!cityClaritySettings.enabled) return 1;
  const s = cityClaritySettings;
  return s.closedSoftness * (1 - _openF(winAnim) * (1 - s.hazeAmount));
}

// Reflections (drawRoomReflection, glass shimmer strips)
export function getRefMult(winAnim) {
  if (!cityClaritySettings.enabled) return 1;
  const s = cityClaritySettings;
  return s.closedSoftness * (1 - _openF(winAnim) * (1 - s.reflectionAmount));
}

// Glass shimmer — same base as reflections, slightly more aggressive when
// preserveBillboards is on (reduces shimmer over billboard quads)
export function getGlassMult(winAnim) {
  const base = getRefMult(winAnim);
  return cityClaritySettings.preserveBillboards ? base * 0.70 : base;
}

// Depth-grade bloom (screen blend radial in drawCityDepthGrade)
export function getDepthMult(winAnim) {
  if (!cityClaritySettings.enabled) return 1;
  const s = cityClaritySettings;
  return s.closedSoftness * (1 - _openF(winAnim) * (1 - s.bloomSoftness));
}

// ── Clarity pass ──────────────────────────────────────────────────────────────
// Very subtle overlay contrast punch, centred on skyline.
// Call AFTER all atmosphere layers, BEFORE glass/rain/window animation.

export function drawSkylineClarityPass(ctx, x, y, w, h, winAnim) {
  const s = cityClaritySettings;
  if (!s.enabled || s.sharpenIntensity < 0.005) return;
  const openF = winAnim * s.clarityAmount * s.sharpenIntensity;
  if (openF < 0.005) return;

  const midX = x + w * 0.50;
  const midY = y + h * 0.38;  // bias toward skyline (upper portion)
  const r    = w * 0.52;

  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // Overlay with a radial white gradient: brightens highlights at centre,
  // giving a slight local contrast / clarity lift. Hard-capped at 0.12 so it
  // never halos or looks like a post-processing toggle.
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = Math.min(openF * 0.18, 0.12);

  const cg = ctx.createRadialGradient(midX, midY, 0, midX, midY, r);
  cg.addColorStop(0,    'rgba(255,255,255,0.28)');
  cg.addColorStop(0.42, 'rgba(255,255,255,0.10)');
  cg.addColorStop(0.78, 'rgba(255,255,255,0.02)');
  cg.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = cg;
  ctx.fillRect(x, y, w, h);

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Debug: atmosphere influence overlay ───────────────────────────────────────

export function drawAtmosphereInfluence(ctx, x, y, w, h, winAnim) {
  if (!cityClaritySettings.showInfluence) return;

  const midX = x + w * 0.50;
  const midY = y + h * 0.40;
  const r    = w * 0.54;

  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.globalCompositeOperation = 'source-over';

  // Centre = green (clear), edges = red (high atmosphere)
  const g = ctx.createRadialGradient(midX, midY, 0, midX, midY, r);
  g.addColorStop(0,   `rgba(0,220,80,${0.10 + 0.04 * (1 - winAnim)})`);
  g.addColorStop(0.5, 'rgba(220,120,0,0.08)');
  g.addColorStop(1,   'rgba(220,20,20,0.20)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  // Status readout
  ctx.globalAlpha = 0.82;
  ctx.font      = 'bold 9px monospace';
  ctx.fillStyle = '#00ff80';
  ctx.textAlign = 'left';
  ctx.fillText(
    `ATM ${getAtmMult(winAnim).toFixed(2)}  REF ${getRefMult(winAnim).toFixed(2)}`
    + `  DEP ${getDepthMult(winAnim).toFixed(2)}  open ${winAnim.toFixed(2)}`,
    x + 5, y + 11
  );

  ctx.restore();
}
