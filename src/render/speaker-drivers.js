// ── SPEAKER DRIVERS ────────────────────────────────────────────────────────
// Audio-reactive tweeter/woofer animation driven by the hi-fi music analyser.
// W-key calibration overlay for visual placement of driver circles.

// ── Config & persistence ──────────────────────────────────────────────────

const LS_KEY = 'hush_speakerdrivers';

const _DEFAULTS = {
  left:  { tweeter: { x: 607, y: 585, r: 6  }, woofer: { x: 607, y: 620, r: 15 } },
  right: { tweeter: { x: 1192, y: 585, r: 6 }, woofer: { x: 1192, y: 620, r: 15 } },
};

export const speakerDrivers = {
  left:  { tweeter: { ..._DEFAULTS.left.tweeter  }, woofer: { ..._DEFAULTS.left.woofer  } },
  right: { tweeter: { ..._DEFAULTS.right.tweeter }, woofer: { ..._DEFAULTS.right.woofer } },
};

// Auto-load saved calibration
try {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    for (const side of ['left', 'right']) {
      if (!saved[side]) continue;
      for (const drv of ['tweeter', 'woofer']) {
        if (saved[side][drv]) Object.assign(speakerDrivers[side][drv], saved[side][drv]);
      }
    }
  }
} catch (_) {}

export function saveSpeakerDrivers() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(speakerDrivers)); } catch (_) {}
}

export function resetSpeakerDrivers() {
  for (const side of ['left', 'right']) {
    for (const drv of ['tweeter', 'woofer']) {
      Object.assign(speakerDrivers[side][drv], _DEFAULTS[side][drv]);
    }
  }
  try { localStorage.removeItem(LS_KEY); } catch (_) {}
}

// ── Strength multipliers ──────────────────────────────────────────────────
// speakerDriverStrength scales both drivers; tweeterMult adds extra boost
// because the tweeter dome is small and needs a stronger signal to be visible.

export let speakerDriverStrength = 1.0;
export let tweeterMult           = 2.5;

// ── Calibration driver index ──────────────────────────────────────────────

export const DRIVER_LIST = [
  { side: 'left',  key: 'tweeter', label: 'LEFT TWEETER'  },
  { side: 'left',  key: 'woofer',  label: 'LEFT WOOFER'   },
  { side: 'right', key: 'tweeter', label: 'RIGHT TWEETER' },
  { side: 'right', key: 'woofer',  label: 'RIGHT WOOFER'  },
];

// ── Audio energy ──────────────────────────────────────────────────────────
// Pre-allocated buffer and output object — zero per-frame allocation.

let _freqBuf      = null;
let _bassSmooth   = 0;
let _trebleSmooth = 0;

const _energyOut = { bass: 0, treble: 0 };

export function readSpeakerEnergy(analyser, musicActive) {
  if (!analyser || !musicActive) {
    _bassSmooth   *= 0.90;
    _trebleSmooth *= 0.90;
    _energyOut.bass   = _bassSmooth;
    _energyOut.treble = _trebleSmooth;
    return _energyOut;
  }

  const binCount = analyser.frequencyBinCount;
  if (!_freqBuf || _freqBuf.length !== binCount) _freqBuf = new Uint8Array(binCount);
  analyser.getByteFrequencyData(_freqBuf);

  // At 44100 Hz, fftSize=1024 → binWidth ≈ 43 Hz.
  // Bass   bins  1-6:   ~43–258 Hz     (kick, bass warmth)
  // Treble bins 30-160: ~1290–6890 Hz  (presence, attack, hi-hats, cymbals)
  let bassSum = 0;
  for (let i = 1; i <= 6; i++) bassSum += _freqBuf[i];
  const bassRaw = bassSum / (6 * 255);

  let trebleSum = 0;
  for (let i = 30; i <= 160; i++) trebleSum += _freqBuf[i];
  const trebleRaw = trebleSum / (131 * 255);

  // Bass: slower smoothing (punchy feel); treble: fast response (snappy transients).
  _bassSmooth   = _bassSmooth   * 0.82 + bassRaw   * 0.18;
  _trebleSmooth = _trebleSmooth * 0.50 + trebleRaw * 0.50;

  _energyOut.bass   = _bassSmooth;
  _energyOut.treble = _trebleSmooth;
  return _energyOut;
}

// ── Visual: audio-reactive driver rendering ───────────────────────────────
// Called after all post-processing passes so effects are clearly visible
// on top of the fully composited scene.

export function drawSpeakerDrivers(cx, energy) {
  const { bass, treble } = energy;
  if (bass < 0.002 && treble < 0.002) return;

  for (const side of ['left', 'right']) {
    const d = speakerDrivers[side];
    _drawWoofer(cx, d.woofer, bass);
    _drawTweeter(cx, d.tweeter, treble);
  }
  _drawActivityGlow(cx, bass, treble);
}

function _drawWoofer(cx, conf, bass) {
  const { x, y, r } = conf;
  const b      = Math.min(bass * speakerDriverStrength, 1.0);
  const depthA = b * 0.12;
  if (depthA < 0.003) return;

  cx.save();
  cx.beginPath();
  cx.arc(x, y, r, 0, Math.PI * 2);
  cx.clip();

  // Cone compression: centre darkens with bass (cone appearing to recess)
  const cg = cx.createRadialGradient(x, y, 0, x, y, r);
  cg.addColorStop(0,    `rgba(0,0,0,${depthA})`);
  cg.addColorStop(0.60, `rgba(0,0,0,${depthA * 0.40})`);
  cg.addColorStop(1,    'rgba(0,0,0,0)');
  cx.globalCompositeOperation = 'source-over';
  cx.globalAlpha = 1;
  cx.fillStyle   = cg;
  cx.fillRect(x - r, y - r, r * 2, r * 2);

  // Dust cap micro-shimmer: tiny centre highlight
  const shimA = b * 0.05;
  if (shimA > 0.002) {
    const dcg = cx.createRadialGradient(x, y, 0, x, y, r * 0.32);
    dcg.addColorStop(0,   `rgba(220,215,205,${shimA})`);
    dcg.addColorStop(1,   'rgba(0,0,0,0)');
    cx.globalCompositeOperation = 'screen';
    cx.fillStyle = dcg;
    cx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  cx.restore();
}

function _drawTweeter(cx, conf, treble) {
  const { x, y, r } = conf;
  const t = Math.min(treble * speakerDriverStrength * tweeterMult, 1.0);
  if (t < 0.008) return;

  cx.save();

  // Dome fill — centre brightens with treble (dome surface shimmer)
  cx.beginPath();
  cx.arc(x, y, r, 0, Math.PI * 2);
  cx.clip();

  const dg = cx.createRadialGradient(x, y, 0, x, y, r);
  dg.addColorStop(0,    `rgba(255,252,245,${t * 0.30})`);
  dg.addColorStop(0.58, `rgba(220,218,208,${t * 0.12})`);
  dg.addColorStop(1,    'rgba(0,0,0,0)');
  cx.globalCompositeOperation = 'source-over';
  cx.globalAlpha = 1;
  cx.fillStyle   = dg;
  cx.fillRect(x - r, y - r, r * 2, r * 2);

  cx.restore();

  // Dome edge ring — concentric ring that catches light with treble transients
  cx.save();
  cx.beginPath();
  cx.arc(x, y, r * 0.76, 0, Math.PI * 2);
  cx.strokeStyle = `rgba(245,242,232,${t * 0.38})`;
  cx.lineWidth   = 0.9;
  cx.globalCompositeOperation = 'source-over';
  cx.globalAlpha = 1;
  cx.stroke();
  cx.restore();
}

function _drawActivityGlow(cx, bass, treble) {
  const level = Math.max(bass * 0.55, treble) * 0.055 * speakerDriverStrength;
  if (level < 0.001) return;

  cx.save();
  cx.globalCompositeOperation = 'screen';
  cx.globalAlpha = 1;
  for (const side of ['left', 'right']) {
    const tw = speakerDrivers[side].tweeter;
    const gg = cx.createRadialGradient(tw.x, tw.y, 0, tw.x, tw.y, tw.r * 2.2);
    gg.addColorStop(0,   `rgba(255,242,210,${level})`);
    gg.addColorStop(1,   'rgba(0,0,0,0)');
    cx.fillStyle = gg;
    cx.fillRect(tw.x - tw.r * 2.5, tw.y - tw.r * 2.5, tw.r * 5, tw.r * 5);
  }
  cx.restore();
}

// ── Calibration overlay ───────────────────────────────────────────────────

function _rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawSpeakerCalibOverlay(cx, activeIdx, energy) {
  const { bass, treble } = energy;

  // ── Help panel ────────────────────────────────────────
  cx.save();
  cx.globalAlpha = 1;

  _rrPath(cx, 22, 22, 294, 218, 6);
  cx.fillStyle = 'rgba(4,7,16,0.92)';
  cx.fill();
  cx.strokeStyle = 'rgba(255,160,80,0.50)';
  cx.lineWidth   = 1;
  cx.stroke();

  cx.font      = 'bold 10px monospace';
  cx.fillStyle = '#ff9040';
  cx.textAlign = 'left';
  cx.fillText('SPEAKER DRIVER CALIBRATION', 34, 42);

  const rows = [
    ['Tab',           'next driver'  ],
    ['arrows',        'move 1px'     ],
    ['Alt+arrows',    'move 10px'    ],
    ['Shift+↑↓',      'radius ±1px'  ],
    ['Sh+Alt+↑↓',     'radius ±5px'  ],
    ['C',             'copy & save'  ],
    ['W / Esc',       'exit'         ],
  ];
  cx.font = '10px monospace';
  let ty  = 62;
  for (const [key, desc] of rows) {
    cx.fillStyle = 'rgba(160,180,200,0.90)';
    cx.fillText(key, 34, ty);
    cx.fillStyle = 'rgba(100,120,140,0.80)';
    cx.fillText(desc, 148, ty);
    ty += 15;
  }

  // ── Live energy meters ────────────────────────────────
  // Colored when active, dim when silent — confirms analyser is reading signal.
  cx.font      = 'bold 9px monospace';
  cx.textAlign = 'left';

  const bFrac = Math.min(bass,   1);
  const tFrac = Math.min(treble, 1);

  cx.globalAlpha = 0.88;
  cx.fillStyle   = bFrac > 0.04
    ? `rgba(100,220,140,${0.60 + bFrac * 0.35})`
    : 'rgba(45,70,60,0.70)';
  cx.fillText(`BASS    ${(bass   * 100).toFixed(0).padStart(3, ' ')}%`, 34, 196);

  cx.fillStyle   = tFrac > 0.04
    ? `rgba(100,185,255,${0.60 + tFrac * 0.35})`
    : 'rgba(45,60,80,0.70)';
  cx.fillText(`TREBLE  ${(treble * 100).toFixed(0).padStart(3, ' ')}%`, 34, 211);

  cx.restore();

  // ── Driver circles ────────────────────────────────────
  for (let i = 0; i < DRIVER_LIST.length; i++) {
    const { side, key, label } = DRIVER_LIST[i];
    const d        = speakerDrivers[side][key];
    const isActive = i === activeIdx;

    cx.save();

    // Ring
    cx.beginPath();
    cx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    cx.strokeStyle = isActive ? 'rgba(255,155,50,0.95)' : 'rgba(120,190,255,0.48)';
    cx.lineWidth   = isActive ? 2 : 1;
    cx.globalAlpha = isActive ? 1.0 : 0.65;
    cx.stroke();

    // Crosshair on active circle
    if (isActive) {
      cx.save();
      cx.setLineDash([3, 4]);
      cx.strokeStyle = 'rgba(255,155,50,0.40)';
      cx.lineWidth   = 1;
      cx.globalAlpha = 1;
      cx.beginPath();
      cx.moveTo(d.x - d.r - 7, d.y); cx.lineTo(d.x + d.r + 7, d.y);
      cx.moveTo(d.x, d.y - d.r - 7); cx.lineTo(d.x, d.y + d.r + 7);
      cx.stroke();
      cx.setLineDash([]);
      cx.restore();
    }

    // Label above
    cx.font      = isActive ? 'bold 9px monospace' : '9px monospace';
    cx.textAlign = 'center';
    cx.fillStyle = isActive ? 'rgba(255,165,60,0.95)' : 'rgba(120,190,255,0.55)';
    cx.globalAlpha = isActive ? 1.0 : 0.65;
    cx.fillText(label, d.x, d.y - d.r - 5);

    if (isActive) {
      cx.font      = '8px monospace';
      cx.fillStyle = 'rgba(255,200,120,0.80)';
      cx.fillText(`r = ${d.r}`, d.x, d.y + d.r + 12);
    }

    cx.restore();
  }
}
