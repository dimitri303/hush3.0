// ── CITY FX ───────────────────────────────────────────────────────────────────
// Animated billboard overlays + procedural window lights for the city view.
// Called from inside drawWindowView's existing clip region.

const LS_SETTINGS = 'hush_cityfx_settings';
const LS_QUADS    = 'hush_cityfx_quads';
const LS_MASKS    = 'hush_cityfx_masks';

// ── Billboard catalogue (names + approximate regions for reference/resets) ────
export const CITY_BILLBOARDS = [
  { x: 680,  y: 200, w: 130, h: 120, name: 'leftTower'      },
  { x: 1080, y: 310, w:  90, h:  90, name: 'midRightSquare' },
  { x: 1130, y: 500, w: 140, h:  60, name: 'lowerWide'      },
  { x: 1200, y: 400, w: 120, h:  80, name: 'rightStack'     },
];

// Tuned perspective-correct quad corners, matched to the city-night.png asset.
// Reset billboard uses these, not rectangular CITY_BILLBOARDS.
const QUAD_DEFAULTS = [
  { name: 'leftTower',      tl:{x:689,y:283}, tr:{x:767,y:289}, br:{x:767,y:321}, bl:{x:688,y:319} },
  { name: 'midRightSquare', tl:{x:1105,y:324}, tr:{x:1152,y:323}, br:{x:1153,y:369}, bl:{x:1103,y:371} },
  { name: 'lowerWide',      tl:{x:1141,y:505}, tr:{x:1249,y:506}, br:{x:1249,y:548}, bl:{x:1141,y:548} },
  { name: 'rightStack',     tl:{x:1228,y:409}, tr:{x:1304,y:408}, br:{x:1304,y:459}, bl:{x:1231,y:460} },
];

// ── Light mask zones — defines where window lights may appear ─────────────────
export const CITY_LIGHT_MASKS = [
  { name: 'leftTallTower',   x: 510, y:  90, w: 180, h: 430 },
  { name: 'leftMidTower',    x: 650, y: 210, w: 170, h: 330 },
  { name: 'centreTallTower', x: 760, y:  80, w: 160, h: 500 },
  { name: 'centreCluster',   x: 900, y: 280, w: 160, h: 300 },
  { name: 'rightMidTower',   x:1060, y: 250, w: 140, h: 350 },
  { name: 'rightLargeTower', x:1190, y: 150, w: 180, h: 420 },
  { name: 'farRightCluster', x:1320, y: 320, w: 150, h: 250 },
  { name: 'lowerCity',       x: 420, y: 470, w: 900, h: 130 },
];

// ── Settings ──────────────────────────────────────────────────────────────────
const _DEFAULTS = {
  enabled:                false,
  billboardIntensity:     0.89,
  billboardFlicker:       0.00,
  billboardScanlines:     1.00,
  billboardColourDrift:   0.54,
  billboardBackingOpacity:0.82,
  billboardContrast:      0.72,
  billboardGlitch:        0.12,
  billboardAnimSpeed:     1.00,
  lightDensity:           0.00,
  lightBrightness:        0.00,
  lightGlow:              0.00,
  nightFactorOverride:    null,
  showOutlines:           true,
  showLights:             true,
  showMaskZones:          false,
};

export const cityFxSettings = { ..._DEFAULTS };

// UI state — not persisted
export const cityFxState = {
  selectedBillboard: QUAD_DEFAULTS[0].name,
  selectedMask:      0,
};

// Diagnostic flags — temporary sharpness investigation, never persisted
export const cityDiag = {
  directTest:   false,  // draw city directly to visibleCtx, bypassing all passes
  noAtmosphere: false,  // skip haze/glass/rain/reflection/grade in drawWindowView
  pixelSnap:    false,  // round dest x/y/w/h to integers in drawCityAsset
};

// Fixed-identity arrays — always same reference, contents mutated in place
export const billboardQuads = [];
export const cityLights     = [];
export const lightMasks     = [];

let _getTimeProfile   = null;
let _lastLightDensity = -1;
let _maskVersion      = 0;
let _lastMaskVersion  = -1;

// ── Quad helpers ──────────────────────────────────────────────────────────────

function _cloneQuad(src) {
  return {
    name: src.name,
    tl: { ...src.tl }, tr: { ...src.tr },
    br: { ...src.br }, bl: { ...src.bl },
  };
}

function quadBounds(q) {
  const xs = [q.tl.x, q.tr.x, q.br.x, q.bl.x];
  const ys = [q.tl.y, q.tr.y, q.br.y, q.bl.y];
  const x  = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

// ── Storage ───────────────────────────────────────────────────────────────────

export function saveToStorage() {
  try { localStorage.setItem(LS_SETTINGS, JSON.stringify(cityFxSettings)); } catch (_) {}
  try { localStorage.setItem(LS_QUADS,    JSON.stringify(billboardQuads));  } catch (_) {}
  try { localStorage.setItem(LS_MASKS,    JSON.stringify(lightMasks));      } catch (_) {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (raw) Object.assign(cityFxSettings, JSON.parse(raw));
  } catch (_) {}
  try {
    const raw = localStorage.getItem(LS_QUADS);
    if (raw) {
      JSON.parse(raw).forEach(saved => {
        const idx = billboardQuads.findIndex(q => q.name === saved.name);
        if (idx >= 0) billboardQuads[idx] = saved;
      });
    }
  } catch (_) {}
  try {
    const raw = localStorage.getItem(LS_MASKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.length > 0) {
        lightMasks.splice(0, lightMasks.length, ...parsed);
        _maskVersion++;
      }
    }
  } catch (_) {}
}

// ── Reset ─────────────────────────────────────────────────────────────────────

export function resetBillboard(name) {
  const def = QUAD_DEFAULTS.find(q => q.name === name);
  if (!def) return;
  const idx = billboardQuads.findIndex(q => q.name === name);
  if (idx >= 0) billboardQuads[idx] = _cloneQuad(def);
}

export function resetMaskZones() {
  lightMasks.splice(0, lightMasks.length, ...CITY_LIGHT_MASKS.map(m => ({ ...m })));
  _maskVersion++;
}

export function resetAllCityFx() {
  Object.assign(cityFxSettings, _DEFAULTS);
  billboardQuads.splice(0, billboardQuads.length, ...QUAD_DEFAULTS.map(_cloneQuad));
  resetMaskZones();
  _generateLights(cityFxSettings.lightDensity);
  try { localStorage.removeItem(LS_SETTINGS); } catch (_) {}
  try { localStorage.removeItem(LS_QUADS);    } catch (_) {}
  try { localStorage.removeItem(LS_MASKS);    } catch (_) {}
}

// ── Light cache invalidation ──────────────────────────────────────────────────

export function invalidateLightCache() { _maskVersion++; }

// ── Light generation — only inside mask zones, tiny rect window dashes ────────

function _generateLights(density) {
  cityLights.length = 0;
  if (lightMasks.length === 0) { _lastLightDensity = density; _lastMaskVersion = _maskVersion; return; }

  const count = Math.round(80 + density * 520);  // 80–600
  for (let i = 0; i < count; i++) {
    // Pick zone — uniform random (each zone equally likely)
    const zone = lightMasks[Math.floor(Math.random() * lightMasks.length)];

    // Position: snap y to ~3px floor grid so lights form loose horizontal rows
    const rawY = zone.y + Math.random() * zone.h;
    const y    = Math.round(rawY / 3) * 3;
    const x    = zone.x + Math.random() * zone.w;

    // Tiny rect: mostly 1×1, sometimes 2×1, rarely 2×2
    const lw = 1 + (Math.random() < 0.30 ? 1 : 0);
    const lh = 1 + (Math.random() < 0.12 ? 1 : 0);

    // Color: 55% warm amber, 30% off-white, 15% cyan
    const roll = Math.random();
    let r, g, b;
    if (roll < 0.55) {
      r = 255; g = 185 + (Math.random() * 60 | 0); b = 55 + (Math.random() * 90 | 0);
    } else if (roll < 0.85) {
      r = 228 + (Math.random() * 22 | 0); g = 222 + (Math.random() * 18 | 0); b = 198 + (Math.random() * 28 | 0);
    } else {
      r = 100 + (Math.random() * 50 | 0); g = 195 + (Math.random() * 55 | 0); b = 255;
    }

    cityLights.push({
      x, y, lw, lh,
      r, g, b,
      phase:        Math.random() * Math.PI * 2,
      onThreshold:  0.16 + Math.random() * 0.60,
      hasGlow:      roll >= 0.85 && Math.random() < 0.12, // rare: only cyan lights
      currentOn:    Math.random() > 0.38,
      nextToggleAt: Math.random() * 60,
    });
  }
  _lastLightDensity = density;
  _lastMaskVersion  = _maskVersion;
}

export function ensureLightsDensity() {
  const densityDiff  = Math.abs(_lastLightDensity - cityFxSettings.lightDensity) > 0.03;
  const masksChanged = _maskVersion !== _lastMaskVersion;
  if (densityDiff || masksChanged) _generateLights(cityFxSettings.lightDensity);
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initCityFx(getTimeProfileFn) {
  _getTimeProfile = getTimeProfileFn;
  billboardQuads.splice(0, billboardQuads.length, ...QUAD_DEFAULTS.map(_cloneQuad));
  lightMasks.splice(0, lightMasks.length, ...CITY_LIGHT_MASKS.map(m => ({ ...m })));
  _generateLights(cityFxSettings.lightDensity);
  loadFromStorage();  // overrides defaults with any persisted state
  // Re-generate lights with loaded settings/masks
  _generateLights(cityFxSettings.lightDensity);
}

// ── Night factor ──────────────────────────────────────────────────────────────

export function getCityFxNightFactor() {
  if (cityFxSettings.nightFactorOverride !== null) return cityFxSettings.nightFactorOverride;
  if (!_getTimeProfile) return 1;
  const tp = _getTimeProfile();
  return 0.10 * tp.day + 0.60 * tp.sunset + 1.0 * tp.night;
}

// ── Billboard colour palette ──────────────────────────────────────────────────
const _BB_COLS = [
  [  0, 195, 255],   // cyan
  [255,  48, 188],   // magenta
  [255, 158,  28],   // amber
  [118, 255, 128],   // green
  [172,  80, 255],   // violet
];

// ── Draw: billboard animated screen content ───────────────────────────────────
// Each billboard:
//   1. Dark backing — suppresses the static city-night.png billboard art
//   2. Scrolling colour gradient — simulates vivid screen content
//   3. Headline strip — bold bright bar near top
//   4. Body bands — text/info rows below
//   5. Diagonal shine sweep
//   6. Scanlines
//   7. Glitch bars (triggered by glitch setting)

export function drawAnimatedCityBillboards(ctx, t, nightFactor) {
  if (!cityFxSettings.enabled) return;
  const s = cityFxSettings;
  const masterA = s.billboardIntensity * nightFactor;
  if (masterA < 0.02) return;

  for (let qi = 0; qi < billboardQuads.length; qi++) {
    const q   = billboardQuads[qi];
    const bnd = quadBounds(q);
    if (bnd.w < 1 || bnd.h < 1) continue;

    const at = t * s.billboardAnimSpeed;

    // Colour drift between adjacent palette entries
    const col  = _BB_COLS[qi % _BB_COLS.length];
    const col2 = _BB_COLS[(qi + 2) % _BB_COLS.length];
    const dMix = (0.5 + 0.5 * Math.sin(at * 0.038 + qi * 1.27)) * s.billboardColourDrift;
    const cr   = (col[0] + (col2[0] - col[0]) * dMix) | 0;
    const cg   = (col[1] + (col2[1] - col[1]) * dMix) | 0;
    const cb   = (col[2] + (col2[2] - col[2]) * dMix) | 0;

    // Compound flicker
    let fA = 1;
    if (s.billboardFlicker > 0) {
      const f1 = 0.5 + 0.5 * Math.sin(at * 0.58 + qi * 2.1);
      const f2 = 0.5 + 0.5 * Math.sin(at * 1.73 + qi * 0.83);
      fA = 1 - s.billboardFlicker * (1 - (f1 * 0.68 + f2 * 0.32)) * 0.70;
    }
    const eff = masterA * fA;
    if (eff < 0.005) continue;

    ctx.save();

    // Clip to (potentially skewed) quad
    ctx.beginPath();
    ctx.moveTo(q.tl.x, q.tl.y); ctx.lineTo(q.tr.x, q.tr.y);
    ctx.lineTo(q.br.x, q.br.y); ctx.lineTo(q.bl.x, q.bl.y);
    ctx.closePath();
    ctx.clip();

    ctx.globalCompositeOperation = 'source-over';

    // 1. Dark backing — suppress static billboard art
    ctx.globalAlpha = s.billboardBackingOpacity * eff;
    ctx.fillStyle   = '#030508';
    ctx.fillRect(bnd.x, bnd.y, bnd.w, bnd.h);

    // 2. Scrolling colour gradient (vertical wipe, slow)
    const scroll = (at * 0.05 + qi * 0.33) % 1;
    const gy     = bnd.y - bnd.h * 0.5 + scroll * bnd.h * 2;
    const bgGrd  = ctx.createLinearGradient(bnd.x, gy, bnd.x, gy + bnd.h * 2);
    const c2     = s.billboardContrast;
    bgGrd.addColorStop(0,    `rgba(${cr>>2},${cg>>2},${cb>>2},0)`);
    bgGrd.addColorStop(0.35, `rgba(${cr>>1},${cg>>1},${cb>>1},${(0.45 * c2).toFixed(3)})`);
    bgGrd.addColorStop(0.65, `rgba(${cr},${cg},${cb},${(0.55 * c2).toFixed(3)})`);
    bgGrd.addColorStop(1,    `rgba(${cr>>2},${cg>>2},${cb>>2},0)`);
    ctx.globalAlpha = eff;
    ctx.fillStyle   = bgGrd;
    ctx.fillRect(bnd.x, bnd.y, bnd.w, bnd.h);

    // 3. Headline strip (~top 20%)
    const hH     = Math.max(3, bnd.h * 0.20);
    const hY     = bnd.y + bnd.h * 0.08;
    const hPulse = 0.70 + 0.30 * Math.sin(at * 0.4 + qi * 1.22);
    ctx.globalAlpha = eff * c2 * hPulse;
    ctx.fillStyle   = `rgb(${cr},${cg},${cb})`;
    ctx.fillRect(bnd.x + bnd.w * 0.07, hY, bnd.w * 0.86, hH);

    // Dark separator under headline
    ctx.globalAlpha = eff * 0.50;
    ctx.fillStyle   = '#030508';
    ctx.fillRect(bnd.x + bnd.w * 0.07, hY + hH, bnd.w * 0.86, Math.max(1, bnd.h * 0.04));

    // 4. Body bands (2-3 rows, simulating text content)
    const bPhase = at * 0.07 + qi * 0.85;
    const rows   = 2 + (qi % 2);
    for (let row = 0; row < rows; row++) {
      const ry = bnd.y + bnd.h * (0.40 + row * 0.22);
      if (ry + 2 > bnd.y + bnd.h * 0.94) break;
      const rw = bnd.w * Math.max(0.1, 0.28 + 0.44 * (((row * 0.618 + qi * 0.25 + bPhase * 0.06) % 1)));
      const rA = Math.max(0, 0.26 + 0.18 * Math.sin(bPhase + row * 1.3));
      ctx.globalAlpha = eff * c2 * rA;
      ctx.fillStyle   = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(bnd.x + bnd.w * 0.07, ry, rw, Math.max(2, bnd.h * 0.065));
    }

    // 5. Diagonal shine sweep
    const swPhase = (at * 0.28 + qi * 0.75) % (Math.PI * 2);
    const swPos   = 0.5 + 0.5 * Math.sin(swPhase);
    const swW     = bnd.w * 0.30;
    const swX     = bnd.x + swPos * (bnd.w + swW) - swW * 0.5;
    const swGrd   = ctx.createLinearGradient(swX, bnd.y, swX + swW, bnd.y + bnd.h);
    swGrd.addColorStop(0,   'rgba(255,255,255,0)');
    swGrd.addColorStop(0.5, `rgba(255,255,255,${(0.055 * c2).toFixed(3)})`);
    swGrd.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.globalAlpha = eff;
    ctx.fillStyle   = swGrd;
    ctx.fillRect(bnd.x, bnd.y, bnd.w, bnd.h);

    // 6. Scanlines (every 2px)
    if (s.billboardScanlines > 0.01) {
      ctx.globalAlpha = s.billboardScanlines * 0.20 * eff;
      ctx.fillStyle   = 'rgba(0,0,0,1)';
      for (let sy = bnd.y; sy < bnd.y + bnd.h; sy += 2) {
        ctx.fillRect(bnd.x, sy, bnd.w, 1);
      }
    }

    // 7. Glitch bar — rare, brief horizontal inversion strip
    if (s.billboardGlitch > 0.01) {
      const gT = at * 3.6 + qi * 11.2;
      if (Math.sin(gT) > 1 - s.billboardGlitch * 1.6) {
        const gFrac = Math.abs(Math.sin(gT * 1.7 + qi));
        const gBarY = bnd.y + (gFrac * bnd.h) | 0;
        const gBarH = Math.max(1, Math.min(Math.abs(Math.sin(gT * 2.2)) * 8 | 0, bnd.h * 0.25));
        ctx.globalAlpha = eff * s.billboardGlitch * 0.88;
        ctx.fillStyle   = `rgba(${255-cr},${255-cg},${255-cb},0.88)`;
        ctx.fillRect(bnd.x, gBarY, bnd.w, gBarH);
      }
    }

    ctx.restore();
  }
}

// ── Draw: procedural window lights ────────────────────────────────────────────
// Tiny rectangular dashes placed only inside mask zones.
// Time-based on/off toggle — no Math.random per frame.

export function drawCityWindowLights(ctx, t) {
  if (!cityFxSettings.enabled || !cityFxSettings.showLights) return;
  ensureLightsDensity();

  const s      = cityFxSettings;
  const nightF = getCityFxNightFactor();
  const bright = s.lightBrightness;
  const glow   = s.lightGlow;
  if (nightF < 0.04 && bright < 0.06) return;
  if (cityLights.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  for (let i = 0; i < cityLights.length; i++) {
    const lt = cityLights[i];

    // Time-based toggle
    if (t >= lt.nextToggleAt) {
      const onProb    = nightF > lt.onThreshold ? 0.76 : 0.06;
      lt.currentOn    = Math.random() < onProb;
      lt.nextToggleAt = t + 8 + Math.random() * 52;
    }
    if (!lt.currentOn) continue;

    const vis = Math.max(0, (nightF - lt.onThreshold * 0.40) / 0.80);
    if (vis < 0.01) continue;

    // Subtle twinkle — very mild for windows (they don't flicker much)
    const twinkle = 0.85 + 0.15 * Math.sin(t * 0.55 + lt.phase);
    const alpha   = vis * bright * twinkle * (0.42 + 0.58 * nightF);
    if (alpha < 0.01) continue;

    const { x, y, lw, lh, r: lr, g: lg, b: lb } = lt;

    // Optional soft glow for rare cyan lights
    if (lt.hasGlow && glow > 0.04) {
      const glowR = 5 + glow * 8;
      const g2    = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      g2.addColorStop(0, `rgba(${lr},${lg},${lb},${(alpha * glow * 0.22).toFixed(3)})`);
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle   = g2;
      ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);
    }

    // Core window dash — tiny rect
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = `rgb(${lr},${lg},${lb})`;
    ctx.fillRect(x, y, lw, lh);
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

// ── Draw: debug overlays ──────────────────────────────────────────────────────
// Billboard outlines and/or mask zone outlines, depending on settings.

export function drawCityFxDebugOverlay(ctx) {
  const s = cityFxSettings;
  if (!s.showOutlines && !s.showMaskZones) return;

  ctx.save();
  ctx.font         = 'bold 10px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Billboard outlines
  if (s.showOutlines) {
    const sel = cityFxState.selectedBillboard;
    for (let i = 0; i < billboardQuads.length; i++) {
      const q     = billboardQuads[i];
      const isSel = q.name === sel;

      ctx.strokeStyle = isSel ? 'rgba(255,220,50,0.92)' : 'rgba(100,210,255,0.32)';
      ctx.lineWidth   = isSel ? 2 : 1;
      ctx.setLineDash(isSel ? [] : [4, 4]);

      ctx.beginPath();
      ctx.moveTo(q.tl.x, q.tl.y); ctx.lineTo(q.tr.x, q.tr.y);
      ctx.lineTo(q.br.x, q.br.y); ctx.lineTo(q.bl.x, q.bl.y);
      ctx.closePath();
      ctx.stroke();

      if (isSel) {
        const corners = [
          { pt: q.tl, lbl: 'TL' }, { pt: q.tr, lbl: 'TR' },
          { pt: q.br, lbl: 'BR' }, { pt: q.bl, lbl: 'BL' },
        ];
        for (const { pt, lbl } of corners) {
          ctx.fillStyle = 'rgba(255,220,50,0.92)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.fillText(lbl, pt.x, pt.y);
        }
      }
    }
    ctx.setLineDash([]);
  }

  // Mask zone outlines
  if (s.showMaskZones) {
    const selIdx = cityFxState.selectedMask;
    for (let i = 0; i < lightMasks.length; i++) {
      const m     = lightMasks[i];
      const isSel = i === selIdx;
      ctx.strokeStyle = isSel ? 'rgba(120,255,140,0.80)' : 'rgba(120,255,140,0.22)';
      ctx.lineWidth   = isSel ? 1.5 : 0.75;
      ctx.setLineDash(isSel ? [2, 3] : [3, 5]);
      ctx.strokeRect(m.x, m.y, m.w, m.h);
      if (isSel) {
        ctx.font      = 'bold 9px monospace';
        ctx.fillStyle = 'rgba(120,255,140,0.75)';
        ctx.textAlign = 'left';
        ctx.fillText(m.name, m.x + 3, m.y + 10);
        ctx.textAlign = 'center';
      }
    }
    ctx.setLineDash([]);
  }

  ctx.restore();
}
