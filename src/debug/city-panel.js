// ── CITY FX DEBUG PANEL (L key) ───────────────────────────────────────────────
// Independent of the Ctrl+Shift+G developer panel.
// Manages cityFxSettings, billboardQuads, and lightMasks from city-fx.js.

const SLIDER_DEFS = [
  { key: 'billboardIntensity',      label: 'Intensity',    min: 0,   max: 1, step: 0.01, sec: 'bb'  },
  { key: 'billboardFlicker',        label: 'Flicker',      min: 0,   max: 1, step: 0.01, sec: 'bb'  },
  { key: 'billboardScanlines',      label: 'Scanlines',    min: 0,   max: 1, step: 0.01, sec: 'bb'  },
  { key: 'billboardColourDrift',    label: 'Colour drift', min: 0,   max: 1, step: 0.01, sec: 'bb'  },
  { key: 'billboardBackingOpacity', label: 'Backing',      min: 0,   max: 1, step: 0.01, sec: 'bb'  },
  { key: 'billboardContrast',       label: 'Contrast',     min: 0,   max: 1, step: 0.01, sec: 'bb'  },
  { key: 'billboardGlitch',         label: 'Glitch',       min: 0,   max: 1, step: 0.01, sec: 'bb'  },
  { key: 'billboardAnimSpeed',      label: 'Speed',        min: 0.1, max: 3, step: 0.05, sec: 'bb'  },
  { key: 'lightDensity',            label: 'Density',      min: 0,   max: 1, step: 0.01, sec: 'lts' },
  { key: 'lightBrightness',         label: 'Brightness',   min: 0,   max: 1, step: 0.01, sec: 'lts' },
  { key: 'lightGlow',               label: 'Glow',         min: 0,   max: 1, step: 0.01, sec: 'lts' },
];

const MOON_SLIDER_DEFS = [
  { key: 'opacity',          label: 'Opacity',    min: 0,   max: 1,    step: 0.01, dp: 2 },
  { key: 'sizeMult',         label: 'Size',       min: 0.5, max: 2,    step: 0.05, dp: 2 },
  { key: 'glow',             label: 'Glow',       min: 0,   max: 0.5,  step: 0.01, dp: 2 },
  { key: 'arcHeight',        label: 'Arc height', min: 0,   max: 300,  step: 1,    dp: 0 },
  { key: 'horizontalTravel', label: 'H travel',   min: 0,   max: 600,  step: 1,    dp: 0 },
  { key: 'baseX',            label: 'Base X',     min: 427, max: 1498, step: 1,    dp: 0 },
  { key: 'baseY',            label: 'Base Y',     min: 100, max: 650,  step: 1,    dp: 0 },
];

const CLARITY_SLIDER_DEFS = [
  { key: 'clarityAmount',         label: 'Clarity',     min: 0,   max: 1,   step: 0.01 },
  { key: 'closedSoftness',        label: 'Closed soft', min: 0,   max: 1,   step: 0.01 },
  { key: 'openClarityBoost',      label: 'Open boost',  min: 0,   max: 1,   step: 0.01 },
  { key: 'hazeAmount',            label: 'Haze',        min: 0,   max: 1,   step: 0.01 },
  { key: 'reflectionAmount',      label: 'Reflection',  min: 0,   max: 1,   step: 0.01 },
  { key: 'bloomSoftness',         label: 'Bloom soft',  min: 0,   max: 1,   step: 0.01 },
  { key: 'sharpenIntensity',      label: 'Sharpen',     min: 0,   max: 0.5, step: 0.01 },
  { key: 'billboardClarityBoost', label: 'Billboard',   min: 0,   max: 1,   step: 0.01 },
];

function fmt(v) { return (+v).toFixed(2); }

function injectCss() {
  if (document.getElementById('cfx-css')) return;
  const s = document.createElement('style');
  s.id = 'cfx-css';
  s.textContent = `
#cfx-panel{
  position:fixed;top:20px;right:20px;width:276px;max-height:88vh;
  overflow-y:auto;overflow-x:hidden;
  background:rgba(7,10,17,.86);
  border:1px solid rgba(154,204,255,.13);
  backdrop-filter:blur(12px);
  font-family:Inter,Segoe UI,Arial,sans-serif;font-size:11px;color:#dce6f2;
  z-index:9998;display:none;
  scrollbar-width:thin;scrollbar-color:rgba(100,180,255,.18) transparent;
}
#cfx-panel.open{display:block}
#cfx-panel::-webkit-scrollbar{width:3px}
#cfx-panel::-webkit-scrollbar-thumb{background:rgba(100,180,255,.18);border-radius:2px}
.cfx-hdr{
  display:flex;justify-content:space-between;align-items:center;
  padding:9px 11px 7px;border-bottom:1px solid rgba(154,204,255,.10);
  position:sticky;top:0;background:rgba(7,10,17,.94);z-index:1;
}
.cfx-title{font-size:9px;letter-spacing:.22em;color:#89dfff;text-transform:uppercase}
.cfx-close{background:none;border:none;color:rgba(220,230,245,.30);font-size:14px;cursor:pointer;padding:2px 5px;line-height:1;font-family:inherit}
.cfx-close:hover{color:#dce6f2}
.cfx-body{padding:8px 10px 14px}
.cfx-sec{margin-bottom:10px}
.cfx-sec-title{
  font-size:8px;letter-spacing:.2em;color:rgba(137,223,255,.50);
  text-transform:uppercase;margin-bottom:6px;padding-bottom:4px;
  border-bottom:1px solid rgba(154,204,255,.08);
}
.cfx-row{display:flex;align-items:center;margin-bottom:4px;gap:5px}
.cfx-lbl{flex:0 0 74px;color:#8ea1b7;font-size:10px;white-space:nowrap}
.cfx-slider{flex:1;min-width:0;accent-color:#89dfff;cursor:pointer;height:3px}
.cfx-val{flex:0 0 28px;text-align:right;color:#b4f2ff;font-size:10px;font-variant-numeric:tabular-nums}
.cfx-chk{display:flex;align-items:center;gap:6px;margin-bottom:5px;cursor:pointer;font-size:11px}
.cfx-chk input[type=checkbox]{accent-color:#89dfff;cursor:pointer}
.cfx-sel{
  width:100%;background:rgba(18,26,42,.75);
  border:1px solid rgba(154,204,255,.15);color:#dce6f2;
  padding:4px 6px;font:inherit;font-size:11px;cursor:pointer;margin-bottom:6px;
}
.cfx-text{
  flex:1;min-width:0;background:rgba(18,26,42,.75);
  border:1px solid rgba(154,204,255,.15);color:#dce6f2;
  padding:3px 5px;font:inherit;font-size:11px;
}
.cfx-corner-hdr{font-size:9px;color:#89dfff;letter-spacing:.12em;margin:6px 0 3px}
.cfx-coord-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;margin-bottom:8px}
.cfx-mask-coords{display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;margin-bottom:6px;margin-top:4px}
.cfx-coord-pair{display:flex;align-items:center;gap:3px}
.cfx-coord-lbl{color:#8ea1b7;font-size:10px;flex:0 0 8px}
.cfx-num{
  width:54px;background:rgba(18,26,42,.75);
  border:1px solid rgba(154,204,255,.15);color:#dce6f2;
  padding:3px 4px;font:inherit;font-size:11px;text-align:right;
}
.cfx-nudge-row{display:flex;gap:4px;align-items:center;margin-bottom:6px;flex-wrap:wrap}
.cfx-nudge-lbl{color:#8ea1b7;font-size:10px;flex:0 0 auto}
.cfx-nudge-sel{
  background:rgba(18,26,42,.75);border:1px solid rgba(154,204,255,.15);
  color:#dce6f2;padding:3px 5px;font:inherit;font-size:11px;cursor:pointer;
}
.cfx-nb{
  background:rgba(18,26,42,.75);border:1px solid rgba(154,204,255,.15);
  color:#b4f2ff;padding:3px 7px;font:inherit;font-size:11px;
  cursor:pointer;min-width:22px;text-align:center;
}
.cfx-nb:hover{background:rgba(137,223,255,.10)}
.cfx-btn-row{display:flex;gap:4px;flex-wrap:wrap;margin-top:3px}
.cfx-btn{
  background:rgba(18,26,42,.75);border:1px solid rgba(154,204,255,.15);
  color:#b4f2ff;padding:5px 7px;font:inherit;font-size:10px;
  letter-spacing:.07em;cursor:pointer;flex:1;min-width:0;white-space:nowrap;
}
.cfx-btn:hover{background:rgba(137,223,255,.10)}
`;
  document.head.appendChild(s);
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function moonSliderRows(ms) {
  return MOON_SLIDER_DEFS.map(d => {
    const disp = d.dp === 0 ? Math.round(ms[d.key]) : (+ms[d.key]).toFixed(d.dp);
    return `
    <div class="cfx-row">
      <span class="cfx-lbl">${d.label}</span>
      <input type="range" class="cfx-slider" data-mfx="${d.key}"
        min="${d.min}" max="${d.max}" step="${d.step}" value="${ms[d.key]}">
      <span class="cfx-val" id="cfx-mv-${d.key}">${disp}</span>
    </div>`;
  }).join('');
}

function claritySliderRows(cs) {
  return CLARITY_SLIDER_DEFS.map(d => `
    <div class="cfx-row">
      <span class="cfx-lbl">${d.label}</span>
      <input type="range" class="cfx-slider" data-ccs="${d.key}"
        min="${d.min}" max="${d.max}" step="${d.step}" value="${cs[d.key]}">
      <span class="cfx-val" id="cfx-cv-${d.key}">${fmt(cs[d.key])}</span>
    </div>`
  ).join('');
}

function sliderRows(settings, sec) {
  return SLIDER_DEFS
    .filter(d => d.sec === sec)
    .map(d => `
      <div class="cfx-row">
        <span class="cfx-lbl">${d.label}</span>
        <input type="range" class="cfx-slider" data-cfx="${d.key}"
          min="${d.min}" max="${d.max}" step="${d.step}" value="${settings[d.key]}">
        <span class="cfx-val" id="cfx-v-${d.key}">${fmt(settings[d.key])}</span>
      </div>`
    ).join('');
}

function quadInputsHtml(quad) {
  const corners = [
    { k: 'tl', label: 'TL' }, { k: 'tr', label: 'TR' },
    { k: 'br', label: 'BR' }, { k: 'bl', label: 'BL' },
  ];
  return corners.map(({ k, label }) => `
    <div class="cfx-corner-hdr">${label}</div>
    <div class="cfx-coord-pair">
      <span class="cfx-coord-lbl">x</span>
      <input type="number" class="cfx-num" id="cfx-q-${k}-x" value="${quad ? quad[k].x | 0 : 0}" step="1">
    </div>
    <div class="cfx-coord-pair">
      <span class="cfx-coord-lbl">y</span>
      <input type="number" class="cfx-num" id="cfx-q-${k}-y" value="${quad ? quad[k].y | 0 : 0}" step="1">
    </div>
  `).join('');
}

function maskSelOptions(masks, selIdx) {
  return masks.map((m, i) =>
    `<option value="${i}"${i === selIdx ? ' selected' : ''}>${m.name || `Zone ${i}`}</option>`
  ).join('');
}

function maskInputsHtml(masks, selIdx) {
  const m = masks[selIdx];
  return `
    <select class="cfx-sel" id="cfx-mask-sel">
      ${maskSelOptions(masks, selIdx)}
    </select>
    <div class="cfx-row">
      <span class="cfx-lbl">Name</span>
      <input type="text" class="cfx-text" id="cfx-mask-name" value="${m ? m.name : ''}">
    </div>
    <div class="cfx-mask-coords">
      <div class="cfx-coord-pair"><span class="cfx-coord-lbl">x</span><input type="number" class="cfx-num" id="cfx-mask-x" value="${m ? m.x | 0 : 0}" step="1"></div>
      <div class="cfx-coord-pair"><span class="cfx-coord-lbl">y</span><input type="number" class="cfx-num" id="cfx-mask-y" value="${m ? m.y | 0 : 0}" step="1"></div>
      <div class="cfx-coord-pair"><span class="cfx-coord-lbl">w</span><input type="number" class="cfx-num" id="cfx-mask-w" value="${m ? m.w | 0 : 0}" step="1"></div>
      <div class="cfx-coord-pair"><span class="cfx-coord-lbl">h</span><input type="number" class="cfx-num" id="cfx-mask-h" value="${m ? m.h | 0 : 0}" step="1"></div>
    </div>
    <div class="cfx-btn-row">
      <button class="cfx-btn" id="cfx-mask-add">Add zone</button>
      <button class="cfx-btn" id="cfx-mask-del">Delete</button>
      <button class="cfx-btn" id="cfx-mask-reset">Reset zones</button>
    </div>`;
}

function buildHtml(settings, quads, billboards, fxState, getCityFxNightFactor, masks, diag, cs, ms) {
  const autoNf   = settings.nightFactorOverride === null;
  const nfDisp   = settings.nightFactorOverride ?? getCityFxNightFactor();
  const selName  = fxState.selectedBillboard;
  const selQ     = quads.find(q => q.name === selName) || quads[0];
  const selMaskI = fxState.selectedMask ?? 0;

  return `
<div class="cfx-hdr">
  <span class="cfx-title">CITY FX</span>
  <button class="cfx-close" id="cfx-close">×</button>
</div>
<div class="cfx-body">

  <div class="cfx-sec">
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-enabled"${settings.enabled ? ' checked' : ''}> Enabled
    </label>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Billboard</div>
    ${sliderRows(settings, 'bb')}
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Window Lights</div>
    ${sliderRows(settings, 'lts')}
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Night Factor</div>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-nf-auto"${autoNf ? ' checked' : ''}> Auto (from time)
    </label>
    <div class="cfx-row">
      <span class="cfx-lbl">Override</span>
      <input type="range" class="cfx-slider" id="cfx-nf-slider"
        min="0" max="1" step="0.01" value="${fmt(nfDisp)}"${autoNf ? ' disabled' : ''}>
      <span class="cfx-val" id="cfx-nf-val">${fmt(nfDisp)}</span>
    </div>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Debug Vis</div>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-outlines"${settings.showOutlines ? ' checked' : ''}> Billboard outlines
    </label>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-lights"${settings.showLights ? ' checked' : ''}> Window lights
    </label>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-maskzones"${settings.showMaskZones ? ' checked' : ''}> Mask zones
    </label>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Light Mask</div>
    <div id="cfx-mask-section">
      ${maskInputsHtml(masks, selMaskI)}
    </div>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">City Clarity</div>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-cc-enabled"${cs.enabled ? ' checked' : ''}> Enabled
    </label>
    ${claritySliderRows(cs)}
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-cc-preserve"${cs.preserveBillboards ? ' checked' : ''}> Preserve billboard sharpness
    </label>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-cc-influence"${cs.showInfluence ? ' checked' : ''}> Show influence overlay
    </label>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Moon Arc</div>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-mn-enabled"${ms.enabled ? ' checked' : ''}> Enabled
    </label>
    ${moonSliderRows(ms)}
    <div class="cfx-row">
      <span class="cfx-lbl">Direction</span>
      <select class="cfx-nudge-sel" id="cfx-mn-direction" style="flex:1">
        <option value="1"${ms.direction === 1 ? ' selected' : ''}>L → R</option>
        <option value="-1"${ms.direction === -1 ? ' selected' : ''}>R → L</option>
      </select>
    </div>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-mn-showpath"${ms.showPath ? ' checked' : ''}> Show moon path debug
    </label>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Skew Editor</div>
    <select class="cfx-sel" id="cfx-bb-sel">
      ${billboards.map(b =>
        `<option value="${b.name}"${b.name === selName ? ' selected' : ''}>${b.name}</option>`
      ).join('')}
    </select>
    <div class="cfx-coord-grid" id="cfx-quad-grid">
      ${quadInputsHtml(selQ)}
    </div>
    <div class="cfx-nudge-row">
      <span class="cfx-nudge-lbl">Corner:</span>
      <select class="cfx-nudge-sel" id="cfx-nc">
        <option value="tl">TL</option>
        <option value="tr">TR</option>
        <option value="br">BR</option>
        <option value="bl">BL</option>
      </select>
      <button class="cfx-nb" id="cfx-nl">←</button>
      <button class="cfx-nb" id="cfx-nr">→</button>
      <button class="cfx-nb" id="cfx-nu">↑</button>
      <button class="cfx-nb" id="cfx-nd">↓</button>
    </div>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">City Sharpness Diagnostic</div>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-diag-direct"${diag.directTest ? ' checked' : ''}> Direct/native city test
    </label>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-diag-noatm"${diag.noAtmosphere ? ' checked' : ''}> Disable atmosphere/glass
    </label>
    <label class="cfx-chk">
      <input type="checkbox" id="cfx-diag-snap"${diag.pixelSnap ? ' checked' : ''}> Pixel-snap city draw
    </label>
    <div class="cfx-btn-row" style="margin-top:5px">
      <button class="cfx-btn" id="cfx-diag-log">Log render data</button>
      <button class="cfx-btn" id="cfx-diag-css">Check CSS scaling</button>
    </div>
  </div>

  <div class="cfx-sec">
    <div class="cfx-sec-title">Config</div>
    <div class="cfx-btn-row">
      <button class="cfx-btn" id="cfx-copy">Copy config</button>
      <button class="cfx-btn" id="cfx-reset-bb">Reset billboard</button>
      <button class="cfx-btn" id="cfx-reset-all">Reset all</button>
    </div>
  </div>

</div>`;
}

// ── Quad input refresh ────────────────────────────────────────────────────────

function refreshQuadInputs(panel, quads, selName) {
  const q = quads.find(q => q.name === selName);
  if (!q) return;
  const corners = ['tl', 'tr', 'br', 'bl'];
  for (const c of corners) {
    const xEl = panel.querySelector(`#cfx-q-${c}-x`);
    const yEl = panel.querySelector(`#cfx-q-${c}-y`);
    if (xEl && xEl !== document.activeElement) xEl.value = q[c].x | 0;
    if (yEl && yEl !== document.activeElement) yEl.value = q[c].y | 0;
  }
}

// ── Mask helpers ──────────────────────────────────────────────────────────────

function rebuildMaskSel(panel, masks, selIdx) {
  const sel = panel.querySelector('#cfx-mask-sel');
  if (!sel) return;
  sel.innerHTML = maskSelOptions(masks, selIdx);
}

function refreshMaskInputs(panel, masks, selIdx) {
  const m = masks[selIdx];
  const nameEl = panel.querySelector('#cfx-mask-name');
  const xEl    = panel.querySelector('#cfx-mask-x');
  const yEl    = panel.querySelector('#cfx-mask-y');
  const wEl    = panel.querySelector('#cfx-mask-w');
  const hEl    = panel.querySelector('#cfx-mask-h');
  if (!m) {
    if (nameEl) nameEl.value = '';
    if (xEl) xEl.value = 0;
    if (yEl) yEl.value = 0;
    if (wEl) wEl.value = 0;
    if (hEl) hEl.value = 0;
    return;
  }
  if (nameEl && nameEl !== document.activeElement) nameEl.value = m.name;
  if (xEl    && xEl    !== document.activeElement) xEl.value    = m.x | 0;
  if (yEl    && yEl    !== document.activeElement) yEl.value    = m.y | 0;
  if (wEl    && wEl    !== document.activeElement) wEl.value    = m.w | 0;
  if (hEl    && hEl    !== document.activeElement) hEl.value    = m.h | 0;
}

// ── Sync panel UI from current settings ───────────────────────────────────────

function syncPanel(panel, settings, quads, fxState, getCityFxNightFactor, masks, diag, cs, ms) {
  for (const d of SLIDER_DEFS) {
    const sl = panel.querySelector(`[data-cfx="${d.key}"]`);
    if (sl) sl.value = settings[d.key];
    const vl = panel.querySelector(`#cfx-v-${d.key}`);
    if (vl) vl.textContent = fmt(settings[d.key]);
  }
  const en = panel.querySelector('#cfx-enabled');
  if (en) en.checked = settings.enabled;
  const ou = panel.querySelector('#cfx-outlines');
  if (ou) ou.checked = settings.showOutlines;
  const li = panel.querySelector('#cfx-lights');
  if (li) li.checked = settings.showLights;
  const mz = panel.querySelector('#cfx-maskzones');
  if (mz) mz.checked = settings.showMaskZones;

  const autoNf = settings.nightFactorOverride === null;
  const nfAuto = panel.querySelector('#cfx-nf-auto');
  if (nfAuto) nfAuto.checked = autoNf;
  const nfSlider = panel.querySelector('#cfx-nf-slider');
  const nfVal    = panel.querySelector('#cfx-nf-val');
  const nfDisp   = settings.nightFactorOverride ?? getCityFxNightFactor();
  if (nfSlider) { nfSlider.value = fmt(nfDisp); nfSlider.disabled = autoNf; }
  if (nfVal)    nfVal.textContent = fmt(nfDisp);

  refreshQuadInputs(panel, quads, fxState.selectedBillboard);

  const selMaskI = fxState.selectedMask ?? 0;
  rebuildMaskSel(panel, masks, selMaskI);
  refreshMaskInputs(panel, masks, selMaskI);

  if (diag) {
    const dd = panel.querySelector('#cfx-diag-direct');
    if (dd) dd.checked = diag.directTest;
    const da = panel.querySelector('#cfx-diag-noatm');
    if (da) da.checked = diag.noAtmosphere;
    const ds = panel.querySelector('#cfx-diag-snap');
    if (ds) ds.checked = diag.pixelSnap;
  }

  if (ms) {
    for (const d of MOON_SLIDER_DEFS) {
      const sl = panel.querySelector(`[data-mfx="${d.key}"]`);
      if (sl) sl.value = ms[d.key];
      const vl = panel.querySelector(`#cfx-mv-${d.key}`);
      if (vl) vl.textContent = d.dp === 0 ? Math.round(ms[d.key]) : (+ms[d.key]).toFixed(d.dp);
    }
    const me = panel.querySelector('#cfx-mn-enabled');
    if (me) me.checked = ms.enabled;
    const msp = panel.querySelector('#cfx-mn-showpath');
    if (msp) msp.checked = ms.showPath;
    const mdr = panel.querySelector('#cfx-mn-direction');
    if (mdr) mdr.value = String(ms.direction);
  }

  if (cs) {
    for (const d of CLARITY_SLIDER_DEFS) {
      const sl = panel.querySelector(`[data-ccs="${d.key}"]`);
      if (sl) sl.value = cs[d.key];
      const vl = panel.querySelector(`#cfx-cv-${d.key}`);
      if (vl) vl.textContent = fmt(cs[d.key]);
    }
    const en  = panel.querySelector('#cfx-cc-enabled');
    if (en)  en.checked  = cs.enabled;
    const pr  = panel.querySelector('#cfx-cc-preserve');
    if (pr)  pr.checked  = cs.preserveBillboards;
    const inf = panel.querySelector('#cfx-cc-influence');
    if (inf) inf.checked = cs.showInfluence;
  }
}

// ── Public init ───────────────────────────────────────────────────────────────

export function initCityPanel(deps) {
  const {
    settings, quads, billboards, fxState,
    saveToStorage, getCityFxNightFactor, ensureLightsDensity,
    resetBillboard, resetAllCityFx,
    lightMasks, resetMaskZones, invalidateLightCache,
    cityDiag: diag, logCityRenderData, checkCssScaling,
    claritySettings: cs, saveClaritySettings: saveClarity,
    moonSettings: ms, saveMoonFxSettings: saveMoon,
  } = deps;

  injectCss();

  const panel = document.createElement('div');
  panel.id = 'cfx-panel';
  panel.innerHTML = buildHtml(settings, quads, billboards, fxState, getCityFxNightFactor, lightMasks, diag, cs, ms);
  document.body.appendChild(panel);

  // ── L key toggle ──────────────────────────────────────────────────────────
  window.addEventListener('keydown', e => {
    if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) return;
      e.preventDefault();
      panel.classList.toggle('open');
    }
  });

  // ── Click delegation ──────────────────────────────────────────────────────
  panel.addEventListener('click', e => {
    if (e.target.id === 'cfx-close') { panel.classList.remove('open'); return; }

    // Nudge buttons — Shift for ×10
    const step     = e.shiftKey ? 10 : 1;
    const selName  = panel.querySelector('#cfx-bb-sel')?.value;
    const corner   = panel.querySelector('#cfx-nc')?.value || 'tl';
    const q        = quads.find(q => q.name === selName);

    if (e.target.id === 'cfx-nl' && q) { q[corner].x -= step; }
    else if (e.target.id === 'cfx-nr' && q) { q[corner].x += step; }
    else if (e.target.id === 'cfx-nu' && q) { q[corner].y -= step; }
    else if (e.target.id === 'cfx-nd' && q) { q[corner].y += step; }
    else if (e.target.id === 'cfx-copy') {
      const blob = JSON.stringify({
        settings:       { ...settings },
        billboardQuads: quads.map(q => ({
          name: q.name,
          tl: { ...q.tl }, tr: { ...q.tr },
          br: { ...q.br }, bl: { ...q.bl },
        })),
        lightMasks: lightMasks.map(m => ({ ...m })),
      }, null, 2);
      navigator.clipboard?.writeText(blob).catch(() => {});
      const btn = e.target;
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1200);
      return;
    }
    else if (e.target.id === 'cfx-reset-bb') {
      const sel = panel.querySelector('#cfx-bb-sel')?.value;
      if (sel) { resetBillboard(sel); refreshQuadInputs(panel, quads, sel); saveToStorage(); }
      return;
    }
    else if (e.target.id === 'cfx-reset-all') {
      resetAllCityFx();
      fxState.selectedMask = 0;
      syncPanel(panel, settings, quads, fxState, getCityFxNightFactor, lightMasks, diag, cs, ms);
      return;
    }
    // Diagnostic buttons
    else if (e.target.id === 'cfx-diag-log') { logCityRenderData?.(); return; }
    else if (e.target.id === 'cfx-diag-css') { checkCssScaling?.(); return; }
    // Mask zone buttons
    else if (e.target.id === 'cfx-mask-add') {
      lightMasks.push({ name: `Zone ${lightMasks.length}`, x: 600, y: 200, w: 150, h: 200 });
      fxState.selectedMask = lightMasks.length - 1;
      rebuildMaskSel(panel, lightMasks, fxState.selectedMask);
      refreshMaskInputs(panel, lightMasks, fxState.selectedMask);
      invalidateLightCache();
      saveToStorage();
      return;
    }
    else if (e.target.id === 'cfx-mask-del') {
      if (lightMasks.length === 0) return;
      const idx = fxState.selectedMask ?? 0;
      lightMasks.splice(idx, 1);
      fxState.selectedMask = Math.max(0, Math.min(idx, lightMasks.length - 1));
      rebuildMaskSel(panel, lightMasks, fxState.selectedMask);
      refreshMaskInputs(panel, lightMasks, fxState.selectedMask);
      invalidateLightCache();
      saveToStorage();
      return;
    }
    else if (e.target.id === 'cfx-mask-reset') {
      resetMaskZones();
      fxState.selectedMask = 0;
      rebuildMaskSel(panel, lightMasks, 0);
      refreshMaskInputs(panel, lightMasks, 0);
      saveToStorage();
      return;
    }
    else { return; }

    // After nudge: refresh inputs and save
    if (q) { refreshQuadInputs(panel, quads, selName); saveToStorage(); }
  });

  // ── Input delegation ──────────────────────────────────────────────────────
  panel.addEventListener('input', e => {
    const el = e.target;

    if (el.dataset.cfx) {
      const key = el.dataset.cfx;
      settings[key] = parseFloat(el.value);
      const vl = panel.querySelector(`#cfx-v-${key}`);
      if (vl) vl.textContent = fmt(settings[key]);
      if (key === 'lightDensity') ensureLightsDensity();
      saveToStorage();
      return;
    }

    if (el.dataset.ccs) {
      const key = el.dataset.ccs;
      cs[key] = parseFloat(el.value);
      const vl = panel.querySelector(`#cfx-cv-${key}`);
      if (vl) vl.textContent = fmt(cs[key]);
      saveClarity?.();
      return;
    }

    if (el.dataset.mfx) {
      const key = el.dataset.mfx;
      ms[key] = parseFloat(el.value);
      const def = MOON_SLIDER_DEFS.find(d => d.key === key);
      const vl  = panel.querySelector(`#cfx-mv-${key}`);
      if (vl && def) vl.textContent = def.dp === 0 ? Math.round(ms[key]) : (+ms[key]).toFixed(def.dp);
      saveMoon?.();
      return;
    }

    if (el.id === 'cfx-nf-slider') {
      settings.nightFactorOverride = parseFloat(el.value);
      const vl = panel.querySelector('#cfx-nf-val');
      if (vl) vl.textContent = fmt(settings.nightFactorOverride);
      saveToStorage();
      return;
    }

    // Quad number inputs: id format cfx-q-{corner}-{axis}
    const qm = el.id?.match(/^cfx-q-(tl|tr|br|bl)-([xy])$/);
    if (qm) {
      const selName = panel.querySelector('#cfx-bb-sel')?.value;
      const q       = quads.find(q => q.name === selName);
      if (q) { q[qm[1]][qm[2]] = parseFloat(el.value) || 0; saveToStorage(); }
      return;
    }

    // Mask coordinate inputs
    const selIdx = fxState.selectedMask ?? 0;
    const m      = lightMasks[selIdx];
    if (!m) return;

    if (el.id === 'cfx-mask-name') {
      m.name = el.value;
      rebuildMaskSel(panel, lightMasks, selIdx);
      saveToStorage();
      return;
    }
    if (el.id === 'cfx-mask-x') { m.x = parseFloat(el.value) || 0; invalidateLightCache(); saveToStorage(); return; }
    if (el.id === 'cfx-mask-y') { m.y = parseFloat(el.value) || 0; invalidateLightCache(); saveToStorage(); return; }
    if (el.id === 'cfx-mask-w') { m.w = Math.max(1, parseFloat(el.value) || 1); invalidateLightCache(); saveToStorage(); return; }
    if (el.id === 'cfx-mask-h') { m.h = Math.max(1, parseFloat(el.value) || 1); invalidateLightCache(); saveToStorage(); return; }
  });

  // ── Change delegation ─────────────────────────────────────────────────────
  panel.addEventListener('change', e => {
    const el = e.target;

    if (el.id === 'cfx-enabled')   { settings.enabled       = el.checked; saveToStorage(); return; }
    if (el.id === 'cfx-outlines')  { settings.showOutlines  = el.checked; saveToStorage(); return; }
    if (el.id === 'cfx-lights')    { settings.showLights    = el.checked; saveToStorage(); return; }
    if (el.id === 'cfx-maskzones') { settings.showMaskZones = el.checked; saveToStorage(); return; }

    if (el.id === 'cfx-nf-auto') {
      const slider = panel.querySelector('#cfx-nf-slider');
      if (el.checked) {
        settings.nightFactorOverride = null;
        if (slider) slider.disabled = true;
      } else {
        const nf = getCityFxNightFactor();
        settings.nightFactorOverride = nf;
        if (slider) { slider.value = fmt(nf); slider.disabled = false; }
        const vl = panel.querySelector('#cfx-nf-val');
        if (vl) vl.textContent = fmt(nf);
      }
      saveToStorage();
      return;
    }

    if (el.id === 'cfx-bb-sel') {
      fxState.selectedBillboard = el.value;
      refreshQuadInputs(panel, quads, el.value);
      return;
    }

    if (el.id === 'cfx-mask-sel') {
      fxState.selectedMask = parseInt(el.value, 10);
      refreshMaskInputs(panel, lightMasks, fxState.selectedMask);
      return;
    }

    if (diag) {
      if (el.id === 'cfx-diag-direct') { diag.directTest   = el.checked; return; }
      if (el.id === 'cfx-diag-noatm')  { diag.noAtmosphere = el.checked; return; }
      if (el.id === 'cfx-diag-snap')   { diag.pixelSnap    = el.checked; return; }
    }

    if (cs) {
      if (el.id === 'cfx-cc-enabled')   { cs.enabled            = el.checked; saveClarity?.(); return; }
      if (el.id === 'cfx-cc-preserve')  { cs.preserveBillboards = el.checked; saveClarity?.(); return; }
      if (el.id === 'cfx-cc-influence') { cs.showInfluence       = el.checked; saveClarity?.(); return; }
    }

    if (ms) {
      if (el.id === 'cfx-mn-enabled')   { ms.enabled   = el.checked;              saveMoon?.(); return; }
      if (el.id === 'cfx-mn-showpath')  { ms.showPath  = el.checked;              saveMoon?.(); return; }
      if (el.id === 'cfx-mn-direction') { ms.direction = parseInt(el.value, 10);  saveMoon?.(); return; }
    }
  });

  return panel;
}
