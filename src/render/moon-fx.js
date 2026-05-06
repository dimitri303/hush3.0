// ── MOON FX ───────────────────────────────────────────────────────────────────
// Settings and arc math for the cinematic moon arc system.
// Night progress: 0.0 = 18:00 moonrise, 0.5 = 00:00 midnight peak, 1.0 = 06:00 moonset.

const LS_MOON = 'hush_moonfx';

const _DEFAULTS = {
  enabled:          true,
  opacity:          0.75,
  sizeMult:         1.00,
  glow:             0.12,
  arcHeight:        120,
  horizontalTravel: 220,
  baseX:            1304,  // moon center at midnight (near existing asset position)
  baseY:            351,   // baseY - arcHeight = midnight peak y ≈ 231
  direction:        1,     // 1 = left-to-right, -1 = right-to-left
  showPath:         false,
};

export const moonFxSettings = { ..._DEFAULTS };

// ── Persistence ───────────────────────────────────────────────────────────────

export function saveMoonFxSettings() {
  try { localStorage.setItem(LS_MOON, JSON.stringify(moonFxSettings)); } catch (_) {}
}

export function resetMoonFxSettings() {
  Object.assign(moonFxSettings, _DEFAULTS);
  try { localStorage.removeItem(LS_MOON); } catch (_) {}
}

// Auto-load on import
try {
  const raw = localStorage.getItem(LS_MOON);
  if (raw) Object.assign(moonFxSettings, JSON.parse(raw));
} catch (_) {}

// ── Arc math ──────────────────────────────────────────────────────────────────

export function getMoonNightProgress(currentMinutes) {
  // Night window: 18:00 → 06:00 (12 hours, wraps midnight)
  const shifted = (currentMinutes - 18 * 60 + 1440) % 1440;
  return Math.max(0, Math.min(1, shifted / (12 * 60)));
}

export function getMoonPos(currentMinutes) {
  const s  = moonFxSettings;
  const np = getMoonNightProgress(currentMinutes);
  return {
    np,
    x: s.baseX + s.direction * ((np - 0.5) * s.horizontalTravel),
    y: s.baseY - Math.sin(np * Math.PI) * s.arcHeight,
  };
}

// ── Debug: arc path overlay ───────────────────────────────────────────────────

export function drawMoonPathDebug(ctx, winX, winY, winW, winH, currentMinutes) {
  const s = moonFxSettings;

  ctx.save();
  ctx.beginPath(); ctx.rect(winX, winY, winW, winH); ctx.clip();
  ctx.globalCompositeOperation = 'source-over';

  // Dashed arc path
  ctx.strokeStyle = 'rgba(180,210,255,0.55)';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 6]);
  ctx.globalAlpha = 1;
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const np = i / 60;
    const ax = s.baseX + s.direction * ((np - 0.5) * s.horizontalTravel);
    const ay = s.baseY - Math.sin(np * Math.PI) * s.arcHeight;
    i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Key-point dots: moonrise, midnight, moonset
  const KEY_PTS = [
    { np: 0,   label: 'rise',     col: 'rgba(255,210,120,0.85)' },
    { np: 0.5, label: 'midnight', col: 'rgba(200,220,255,0.85)' },
    { np: 1,   label: 'set',      col: 'rgba(255,210,120,0.85)' },
  ];
  ctx.font      = 'bold 8px monospace';
  ctx.textAlign = 'left';
  for (const pt of KEY_PTS) {
    const px = s.baseX + s.direction * ((pt.np - 0.5) * s.horizontalTravel);
    const py = s.baseY - Math.sin(pt.np * Math.PI) * s.arcHeight;
    ctx.fillStyle   = pt.col;
    ctx.globalAlpha = 0.75;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle   = 'rgba(200,220,255,0.90)';
    ctx.fillText(pt.label, px + 7, py + 3);
  }

  // Current moon position marker
  const { x: curX, y: curY } = getMoonPos(currentMinutes);
  ctx.fillStyle   = 'rgba(255,255,255,0.95)';
  ctx.globalAlpha = 0.90;
  ctx.beginPath(); ctx.arc(curX, curY, 3, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}
