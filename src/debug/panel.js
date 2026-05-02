const DEFAULTS = {
  bloom: true, bloomStrength: 0.55, bloomBlur: 14,
  contactShadows: true, contactStrength: 0.75, aoStrength: 0.45,
  atmosphere: true, floorHazeStrength: 0.30, midHazeStrength: 0.22, backFogStrength: 0.18,
  lightWrap: true, wrapWindowStrength: 0.28, wrapLampStrength: 0.22, wrapTvStrength: 0.20, wrapAmbientStrength: 0.16,
  materialResponse: true, materialStrength: 0.55, woodSheenStrength: 0.45, glassSheenStrength: 0.50, metalGlintStrength: 0.38, leatherSheenStrength: 0.30,
  reflections: true, floorReflectionStrength: 0.28, tableReflectionStrength: 0.22, tvReflectionStrength: 0.18, holoReflectionStrength: 0.25, lampReflectionStrength: 0.16,
  colourGrade: true, gradeStrength: 0.42, contrastStrength: 0.18, shadowTintStrength: 0.20, warmMidStrength: 0.12, cyanLiftStrength: 0.10, vignetteStrength: 0.34,
  lensTreatment: true, grain: true, chromaticAberration: true, halation: true, scanTexture: false,
  grainStrength: 0.042, chromaStrength: 0.35, halationStrength: 0.11,
  microMotion: true, microMotionStrength: 0.55, neonBreathStrength: 0.35, lampFlickerStrength: 0.18, tvFlickerStrength: 0.28, hazeDriftStrength: 0.22, reflectionShimmerStrength: 0.24, materialShimmerStrength: 0.12,
  depthPolish: true, depthStrength: 0.32, backgroundSoftness: 0.20, foregroundSoftness: 0.14, midgroundClarity: 0.18, depthVignetteStrength: 0.16,
  adaptiveQuality: true, qualityMode: '900p', supersampling: false, supersampleScale: 1.25,
  sources: { city: true, window: true, tv: true, holo: true, hifi: true },
  shadows: { chair: true, lamp: true, hifi: true, turntable: true, headphones: true, tv: true, table: true, mug: true, remote: true, books: true, holo: true },
  wraps: { chair: true, lamp: true, hifi: true, turntable: true, tv: true, books: true, mug: true, table: true, holo: true },
  materials: { chair: true, hifi: true, turntable: true, tv: true, table: true, mug: true, books: true, holo: true, floor: true },
  reflectionSources: { window: true, city: true, tv: true, holo: true, lamp: true, hifi: true },
};

const PREVIEW_KEYS = ['bloomPreview','contactPreview','atmospherePreview','lightWrapPreview','materialPreview','reflectionsPreview','gradePreview','lensPreview','depthPreview'];

const SCHEMA = [
  {
    id:'bloom', label:'BLOOM', color:'#c080ff',
    toggle:'bloom', preview:'bloomPreview',
    sliders:[
      { label:'Strength', key:'bloomStrength', min:0, max:1.5, step:0.01 },
      { label:'Blur px',  key:'bloomBlur',     min:0, max:48,  step:1   },
    ],
    chips:[{ label:'Sources', obj:'sources', keys:['city','window','tv','holo','hifi'], labels:['City','Window','TV','Holo','HiFi'] }],
  },
  {
    id:'shadows', label:'CONTACT SHADOWS', color:'#ff9040',
    toggle:'contactShadows', preview:'contactPreview',
    sliders:[
      { label:'Contact', key:'contactStrength', min:0, max:1.5, step:0.01 },
      { label:'AO',      key:'aoStrength',      min:0, max:1.5, step:0.01 },
    ],
    chips:[{ label:'Objects', obj:'shadows', keys:['chair','lamp','hifi','turntable','headphones','tv','table','mug','remote','books','holo'], labels:['Chair','Lamp','HiFi','TT','Phones','TV','Table','Mug','Remote','Books','Holo'] }],
  },
  {
    id:'atmos', label:'ATMOSPHERE', color:'#40ddb0',
    toggle:'atmosphere', preview:'atmospherePreview',
    sliders:[
      { label:'Floor haze', key:'floorHazeStrength', min:0, max:1.5, step:0.01 },
      { label:'Mid haze',   key:'midHazeStrength',   min:0, max:1.5, step:0.01 },
      { label:'Back fog',   key:'backFogStrength',   min:0, max:1.5, step:0.01 },
    ],
  },
  {
    id:'wrap', label:'LIGHT WRAP', color:'#ffb970',
    toggle:'lightWrap', preview:'lightWrapPreview',
    sliders:[
      { label:'Window',  key:'wrapWindowStrength',  min:0, max:1.5, step:0.01 },
      { label:'Lamp',    key:'wrapLampStrength',    min:0, max:1.5, step:0.01 },
      { label:'TV',      key:'wrapTvStrength',      min:0, max:1.5, step:0.01 },
      { label:'Ambient', key:'wrapAmbientStrength', min:0, max:1.5, step:0.01 },
    ],
    chips:[{ label:'Objects', obj:'wraps', keys:['chair','lamp','hifi','turntable','tv','books','mug','table','holo'], labels:['Chair','Lamp','HiFi','TT','TV','Books','Mug','Table','Holo'] }],
  },
  {
    id:'material', label:'MATERIAL RESPONSE', color:'#ffdca0',
    toggle:'materialResponse', preview:'materialPreview',
    sliders:[
      { label:'Overall', key:'materialStrength',    min:0, max:1.5, step:0.01 },
      { label:'Wood',    key:'woodSheenStrength',   min:0, max:1.5, step:0.01 },
      { label:'Glass',   key:'glassSheenStrength',  min:0, max:1.5, step:0.01 },
      { label:'Metal',   key:'metalGlintStrength',  min:0, max:1.5, step:0.01 },
      { label:'Leather', key:'leatherSheenStrength',min:0, max:1.5, step:0.01 },
    ],
    chips:[{ label:'Objects', obj:'materials', keys:['chair','hifi','turntable','tv','table','mug','books','holo','floor'], labels:['Chair','HiFi','TT','TV','Table','Mug','Books','Holo','Floor'] }],
  },
  {
    id:'reflect', label:'REFLECTIONS', color:'#80d8ff',
    toggle:'reflections', preview:'reflectionsPreview',
    sliders:[
      { label:'Floor', key:'floorReflectionStrength', min:0, max:1.5, step:0.01 },
      { label:'Table', key:'tableReflectionStrength', min:0, max:1.5, step:0.01 },
      { label:'TV',    key:'tvReflectionStrength',    min:0, max:1.5, step:0.01 },
      { label:'Holo',  key:'holoReflectionStrength',  min:0, max:1.5, step:0.01 },
      { label:'Lamp',  key:'lampReflectionStrength',  min:0, max:1.5, step:0.01 },
    ],
    chips:[{ label:'Sources', obj:'reflectionSources', keys:['window','city','tv','holo','lamp','hifi'], labels:['Window','City','TV','Holo','Lamp','HiFi'] }],
  },
  {
    id:'grade', label:'COLOUR GRADE', color:'#ffe8a0',
    toggle:'colourGrade', preview:'gradePreview',
    sliders:[
      { label:'Grade',       key:'gradeStrength',      min:0, max:1.5, step:0.01 },
      { label:'Contrast',    key:'contrastStrength',   min:0, max:1.5, step:0.01 },
      { label:'Shadow tint', key:'shadowTintStrength', min:0, max:1.5, step:0.01 },
      { label:'Warm mids',   key:'warmMidStrength',    min:0, max:1.5, step:0.01 },
      { label:'Cyan lift',   key:'cyanLiftStrength',   min:0, max:1.5, step:0.01 },
      { label:'Vignette',    key:'vignetteStrength',   min:0, max:1.5, step:0.01 },
    ],
  },
  {
    id:'lens', label:'LENS TREATMENT', color:'#b0f0b0',
    toggle:'lensTreatment', preview:'lensPreview',
    sliders:[
      { label:'Grain',    key:'grainStrength',    min:0, max:0.2, step:0.001 },
      { label:'Chroma',   key:'chromaStrength',   min:0, max:1.5, step:0.01  },
      { label:'Halation', key:'halationStrength', min:0, max:1.0, step:0.01  },
    ],
    toggles:[
      { label:'Film grain',       key:'grain'              },
      { label:'Chroma aberr',     key:'chromaticAberration'},
      { label:'Halation',         key:'halation'           },
      { label:'Scan lines',       key:'scanTexture'        },
    ],
  },
  {
    id:'motion', label:'MICRO-MOTION', color:'#a0ffb8',
    toggle:'microMotion',
    sliders:[
      { label:'Strength',     key:'microMotionStrength',       min:0, max:1.5, step:0.01 },
      { label:'Neon breath',  key:'neonBreathStrength',        min:0, max:1.5, step:0.01 },
      { label:'Lamp flicker', key:'lampFlickerStrength',       min:0, max:1.5, step:0.01 },
      { label:'TV flicker',   key:'tvFlickerStrength',         min:0, max:1.5, step:0.01 },
      { label:'Haze drift',   key:'hazeDriftStrength',         min:0, max:1.5, step:0.01 },
      { label:'Refl shimmer', key:'reflectionShimmerStrength', min:0, max:1.5, step:0.01 },
    ],
  },
  {
    id:'depth', label:'DEPTH POLISH', color:'#c0f0c0',
    toggle:'depthPolish', preview:'depthPreview',
    sliders:[
      { label:'Strength',      key:'depthStrength',         min:0, max:1.5, step:0.01 },
      { label:'BG softness',   key:'backgroundSoftness',   min:0, max:1.5, step:0.01 },
      { label:'FG softness',   key:'foregroundSoftness',   min:0, max:1.5, step:0.01 },
      { label:'Mid clarity',   key:'midgroundClarity',     min:0, max:1.5, step:0.01 },
      { label:'Depth vignette',key:'depthVignetteStrength',min:0, max:1.5, step:0.01 },
    ],
  },
];

const AUDIO_DEFAULTS = { master: 0.85, music: 0.80, vinyl: 0.80 };

function fmtVal(v, step) {
  if (step >= 1)    return Math.round(v).toString();
  if (step <= 0.001) return v.toFixed(3);
  return v.toFixed(2);
}

function injectStyles() {
  if (document.getElementById('gfx-panel-css')) return;
  const s = document.createElement('style');
  s.id = 'gfx-panel-css';
  s.textContent = `
#gfx-panel{position:fixed;top:20px;right:20px;width:340px;max-height:88vh;
  background:rgba(4,7,16,.97);border:1px solid rgba(140,80,230,.35);border-radius:7px;
  font-family:Consolas,'Courier New',monospace;font-size:11px;color:#b8c4dc;
  z-index:10000;display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 6px 48px rgba(50,15,130,.55),inset 0 0 0 1px rgba(200,150,255,.04);}
.gfx-hdr{display:flex;align-items:center;padding:8px 12px;gap:8px;
  background:linear-gradient(90deg,rgba(90,40,190,.22),transparent);
  border-bottom:1px solid rgba(140,80,230,.25);cursor:move;flex-shrink:0;}
.gfx-title{flex:1;color:#c8a8ff;font-size:11px;font-weight:bold;letter-spacing:1.5px;}
.gfx-hdr-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
  color:#8090aa;font:inherit;font-size:10px;padding:2px 7px;border-radius:4px;cursor:pointer;}
.gfx-hdr-btn:hover{background:rgba(255,255,255,.12);color:#c0d0f0;}
.gfx-body{overflow-y:auto;flex:1;scrollbar-width:thin;scrollbar-color:rgba(120,60,220,.4) transparent;}
.gfx-body::-webkit-scrollbar{width:4px;}
.gfx-body::-webkit-scrollbar-thumb{background:rgba(120,60,220,.4);border-radius:2px;}
.gfx-section{border-bottom:1px solid rgba(255,255,255,.04);}
.gfx-sec-hdr{display:flex;align-items:center;padding:5px 10px;
  background:rgba(0,0,0,.25);cursor:default;gap:6px;min-height:26px;}
.gfx-sec-name{flex:1;font-size:9.5px;font-weight:bold;letter-spacing:.8px;}
.gfx-sec-btns{display:flex;align-items:center;gap:5px;flex-shrink:0;}
.gfx-chevron{font-size:11px;color:#506070;cursor:pointer;line-height:1;padding:0 2px;}
.gfx-sec-body{padding:5px 10px 8px;}
.gfx-row{display:flex;align-items:center;gap:6px;margin:3px 0;min-height:18px;}
.gfx-lbl{flex-shrink:0;width:90px;font-size:10px;color:#708090;}
.gfx-slider{flex:1;height:3px;cursor:pointer;accent-color:#8850dd;min-width:0;}
.gfx-val{width:34px;text-align:right;font-size:10px;color:#d0d8f0;flex-shrink:0;}
.gfx-tog-lbl{display:flex;align-items:center;cursor:pointer;}
.gfx-tog{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}
.gfx-tog-pill{display:block;width:24px;height:12px;border-radius:6px;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);position:relative;
  transition:background .15s,border-color .15s;}
.gfx-tog-pill::after{content:'';position:absolute;left:2px;top:2px;width:6px;height:6px;
  border-radius:50%;background:#60708a;transition:transform .15s,background .15s;}
.gfx-tog:checked+.gfx-tog-pill{background:rgba(105,50,205,.45);border-color:rgba(155,95,255,.5);}
.gfx-tog:checked+.gfx-tog-pill::after{transform:translateX(12px);background:#c0a0ff;}
.gfx-preview-btn{font:inherit;font-size:9px;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.10);color:#607888;padding:1px 6px;border-radius:3px;cursor:pointer;}
.gfx-preview-btn:hover{background:rgba(80,140,220,.1);}
.gfx-preview-btn.on{background:rgba(50,120,220,.2);border-color:rgba(90,170,255,.45);color:#80c8ff;}
.gfx-chips{display:flex;align-items:flex-start;gap:4px;margin:4px 0 2px;}
.gfx-chips-hd{flex-shrink:0;width:54px;font-size:9px;color:#506070;padding-top:2px;}
.gfx-chips-wrap{display:flex;flex-wrap:wrap;gap:3px;}
.gfx-chip{font:inherit;font-size:9px;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.09);color:#586878;padding:1px 5px;border-radius:3px;cursor:pointer;}
.gfx-chip:hover{background:rgba(255,255,255,.08);}
.gfx-chip.on{background:rgba(85,45,175,.22);border-color:rgba(135,85,235,.4);color:#b098e0;}
.gfx-chk-lbl{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:10px;color:#7888a0;}
.gfx-chk-lbl input[type=checkbox]{accent-color:#8850dd;width:11px;height:11px;cursor:pointer;}
.gfx-radios{display:flex;gap:10px;}
.gfx-rad-lbl{display:flex;align-items:center;gap:4px;cursor:pointer;font-size:10px;color:#7888a0;}
.gfx-rad-lbl input[type=radio]{accent-color:#8850dd;cursor:pointer;}
.gfx-stats{display:flex;flex-wrap:wrap;gap:10px;padding:6px 0 2px;margin-top:5px;
  border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:#4a5a70;}
.gfx-stats b{color:#90a8c0;font-weight:normal;}
.gfx-hint{padding:7px;text-align:center;font-size:9px;color:#303848;
  border-top:1px solid rgba(255,255,255,.03);}
.gfx-export-section{padding:7px 10px 8px;border-top:1px solid rgba(255,255,255,.05);}
.gfx-export-row{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px;}
.gfx-export-btn{font:inherit;font-size:9px;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.10);color:#607888;padding:2px 7px;border-radius:3px;cursor:pointer;}
.gfx-export-btn:hover{background:rgba(80,160,100,.12);color:#90c8a0;}
.gfx-export-status{font-size:9px;color:#506070;min-height:12px;}
.gfx-audio-status{font-size:9px;color:#405060;letter-spacing:.5px;}
`;
  document.head.appendChild(s);
}

function buildHTML(gfx) {
  const sections = SCHEMA.map(sec => {
    const previewBtn = sec.preview
      ? `<button class="gfx-preview-btn${gfx[sec.preview] ? ' on' : ''}" data-preview="${sec.preview}">preview</button>`
      : '';
    const hdr = `
      <div class="gfx-sec-hdr" data-sid="${sec.id}">
        <span class="gfx-sec-name" style="color:${sec.color}">${sec.label}</span>
        <div class="gfx-sec-btns">
          ${previewBtn}
          <label class="gfx-tog-lbl" title="Enable / disable">
            <input type="checkbox" class="gfx-tog" data-key="${sec.toggle}"${gfx[sec.toggle] ? ' checked' : ''}>
            <span class="gfx-tog-pill"></span>
          </label>
          <span class="gfx-chevron">▾</span>
        </div>
      </div>`;

    const sliderRows = (sec.sliders || []).map(s => `
      <div class="gfx-row">
        <span class="gfx-lbl">${s.label}</span>
        <input type="range" class="gfx-slider" data-key="${s.key}"
               min="${s.min}" max="${s.max}" step="${s.step}" value="${gfx[s.key]}">
        <span class="gfx-val" data-val="${s.key}">${fmtVal(gfx[s.key], s.step)}</span>
      </div>`).join('');

    const toggleRows = (sec.toggles || []).map(t => `
      <div class="gfx-row">
        <span class="gfx-lbl" style="width:auto;flex:1"></span>
        <label class="gfx-chk-lbl">
          <input type="checkbox" data-key="${t.key}"${gfx[t.key] ? ' checked' : ''}>
          <span>${t.label}</span>
        </label>
      </div>`).join('');

    const chipGroups = (sec.chips || []).map(g => `
      <div class="gfx-chips">
        <span class="gfx-chips-hd">${g.label}</span>
        <div class="gfx-chips-wrap">
          ${g.keys.map((k, i) =>
            `<button class="gfx-chip${gfx[g.obj][k] ? ' on' : ''}" data-obj="${g.obj}" data-key="${k}">${g.labels[i]}</button>`
          ).join('')}
        </div>
      </div>`).join('');

    return `
    <div class="gfx-section">
      ${hdr}
      <div class="gfx-sec-body" id="gfx-b-${sec.id}">${sliderRows}${toggleRows}${chipGroups}</div>
    </div>`;
  }).join('');

  const qualitySection = `
    <div class="gfx-section">
      <div class="gfx-sec-hdr" data-sid="quality">
        <span class="gfx-sec-name" style="color:#fff8a0">RENDER QUALITY</span>
        <div class="gfx-sec-btns"><span class="gfx-chevron">▾</span></div>
      </div>
      <div class="gfx-sec-body" id="gfx-b-quality">
        <div class="gfx-row">
          <span class="gfx-lbl">Mode</span>
          <div class="gfx-radios">
            ${['720p','900p','1080p'].map(q =>
              `<label class="gfx-rad-lbl"><input type="radio" name="qualityMode" value="${q}"${gfx.qualityMode===q?' checked':''}><span>${q}</span></label>`
            ).join('')}
          </div>
        </div>
        <div class="gfx-row">
          <label class="gfx-chk-lbl">
            <input type="checkbox" data-key="adaptiveQuality"${gfx.adaptiveQuality?' checked':''}>
            <span>Adaptive quality</span>
          </label>
        </div>
        <div class="gfx-row">
          <label class="gfx-chk-lbl">
            <input type="checkbox" data-key="supersampling"${gfx.supersampling?' checked':''}>
            <span>Supersampling</span>
          </label>
        </div>
        <div class="gfx-row">
          <span class="gfx-lbl">SS scale</span>
          <input type="range" class="gfx-slider" data-key="supersampleScale"
                 min="1" max="2" step="0.05" value="${gfx.supersampleScale}">
          <span class="gfx-val" data-val="supersampleScale">${gfx.supersampleScale.toFixed(2)}</span>
        </div>
        <div class="gfx-stats">
          <span>frame <b id="gfx-fps">–</b></span>
          <span>mode <b id="gfx-qlbl">–</b></span>
          <span>res <b id="gfx-res">–</b></span>
        </div>
      </div>
    </div>`;

  const audioSection = `
    <div class="gfx-section">
      <div class="gfx-sec-hdr" data-sid="audio">
        <span class="gfx-sec-name" style="color:#a0ffd0">AUDIO DEBUG</span>
        <div class="gfx-sec-btns"><span class="gfx-chevron">▾</span></div>
      </div>
      <div class="gfx-sec-body" id="gfx-b-audio">
        <div class="gfx-row">
          <span class="gfx-lbl">Master</span>
          <input type="range" class="gfx-slider" data-audio-key="master" min="0" max="1" step="0.01" value="${AUDIO_DEFAULTS.master}">
          <span class="gfx-val" data-audio-val="master">${AUDIO_DEFAULTS.master.toFixed(2)}</span>
        </div>
        <div class="gfx-row">
          <span class="gfx-lbl">Music bus</span>
          <input type="range" class="gfx-slider" data-audio-key="music" min="0" max="1" step="0.01" value="${AUDIO_DEFAULTS.music}">
          <span class="gfx-val" data-audio-val="music">${AUDIO_DEFAULTS.music.toFixed(2)}</span>
        </div>
        <div class="gfx-row">
          <span class="gfx-lbl">Vinyl loop</span>
          <input type="range" class="gfx-slider" data-audio-key="vinyl" min="0" max="1" step="0.01" value="${AUDIO_DEFAULTS.vinyl}">
          <span class="gfx-val" data-audio-val="vinyl">${AUDIO_DEFAULTS.vinyl.toFixed(2)}</span>
        </div>
        <div class="gfx-row">
          <span id="gfx-audio-status" class="gfx-audio-status">NOT INITIALISED</span>
        </div>
      </div>
    </div>`;

  const exportSection = `
    <div class="gfx-export-section">
      <div style="font-size:9px;color:#506070;letter-spacing:.6px;margin-bottom:5px">EXPORT TUNING</div>
      <div class="gfx-export-row">
        <button class="gfx-export-btn" id="gfx-exp-all">Export All</button>
        <button class="gfx-export-btn" id="gfx-exp-gfx">Export GFX</button>
        <button class="gfx-export-btn" id="gfx-exp-layout">Export Layout</button>
        <button class="gfx-export-btn" id="gfx-exp-hotspots">Export Hotspots</button>
        <button class="gfx-export-btn" id="gfx-exp-scale">Export Scale</button>
      </div>
      <div id="gfx-exp-status" class="gfx-export-status"></div>
    </div>`;

  return `
    <div class="gfx-hdr">
      <span class="gfx-title">GRAPHICS DEBUG</span>
      <button id="gfx-reset" class="gfx-hdr-btn">reset</button>
      <button id="gfx-close" class="gfx-hdr-btn">✕</button>
    </div>
    <div class="gfx-body">
      ${sections}
      ${qualitySection}
      ${audioSection}
      ${exportSection}
      <div class="gfx-hint">Ctrl+Shift+G to toggle</div>
    </div>`;
}

function syncAllControls(panel, gfx) {
  panel.querySelectorAll('.gfx-slider').forEach(input => {
    const k = input.dataset.key;
    if (k && gfx[k] != null) {
      input.value = gfx[k];
      const valEl = panel.querySelector(`[data-val="${k}"]`);
      if (valEl) valEl.textContent = fmtVal(gfx[k], parseFloat(input.step));
    }
  });
  panel.querySelectorAll('input[type=checkbox][data-key]').forEach(cb => {
    if (gfx[cb.dataset.key] != null) cb.checked = !!gfx[cb.dataset.key];
  });
  panel.querySelectorAll('.gfx-chip').forEach(btn => {
    const { obj, key: k } = btn.dataset;
    btn.classList.toggle('on', !!(gfx[obj]?.[k]));
  });
  panel.querySelectorAll('[name=qualityMode]').forEach(r => { r.checked = r.value === gfx.qualityMode; });
  panel.querySelectorAll('.gfx-preview-btn').forEach(btn => {
    btn.classList.toggle('on', !!gfx[btn.dataset.preview]);
  });
}

const EXPORT_SKIP = new Set([...PREVIEW_KEYS, 'debug', 'renderScale']);
const MAP_KEYS = ['sources', 'shadows', 'wraps', 'materials', 'reflectionSources'];

function buildGfxExport(gfx) {
  const out = {};
  Object.keys(DEFAULTS).forEach(k => {
    if (EXPORT_SKIP.has(k)) return;
    out[k] = MAP_KEYS.includes(k) ? { ...gfx[k] } : gfx[k];
  });
  return `// GFX tuning snapshot — paste into DEFAULTS in src/debug/panel.js\n${JSON.stringify(out, null, 2)}`;
}

function buildLayoutExport(layout) {
  const lines = Object.entries(layout).map(([k, v]) => `  ${k}: ${JSON.stringify(v)},`).join('\n');
  return `// Layout snapshot — paste into createLayout() return in src/scene/config.js\n{\n${lines}\n}`;
}

function buildHotspotsExport(hotspots) {
  const lines = hotspots.map(h => `  ${JSON.stringify({ id: h.id, hit: h.hit, focus: h.focus, zoom: h.zoom })},`).join('\n');
  return `// Hotspots snapshot — patch hit/focus/zoom in src/scene/config.js\n[\n${lines}\n]`;
}

function buildScaleGuidesExport(guides) {
  const lines = guides.map(g => `  ${JSON.stringify(g)},`).join('\n');
  return `// scaleGuides snapshot — patch in src/app.js\n[\n${lines}\n]`;
}

export function createDebugPanel(gfx, deps) {
  injectStyles();

  const panel = document.createElement('div');
  panel.id = 'gfx-panel';
  panel.innerHTML = buildHTML(gfx);
  panel.style.display = 'none';
  document.body.appendChild(panel);

  // ── Drag ──────────────────────────────────────────────
  const hdr = panel.querySelector('.gfx-hdr');
  let drag = null;
  hdr.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    const r = panel.getBoundingClientRect();
    drag = { ox: e.clientX, oy: e.clientY, left: r.left, top: r.top };
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    panel.style.right = 'auto';
    panel.style.left = `${drag.left + e.clientX - drag.ox}px`;
    panel.style.top  = `${drag.top  + e.clientY - drag.oy}px`;
  });
  document.addEventListener('mouseup', () => { drag = null; });

  // ── Slider input ──────────────────────────────────────
  panel.addEventListener('input', e => {
    const k = e.target.dataset.key;
    if (e.target.type === 'range' && k) {
      gfx[k] = parseFloat(e.target.value);
      const v = panel.querySelector(`[data-val="${k}"]`);
      if (v) v.textContent = fmtVal(gfx[k], parseFloat(e.target.step));
    }
    const ak = e.target.dataset.audioKey;
    if (e.target.type === 'range' && ak) {
      const val = parseFloat(e.target.value);
      const buses = deps.getAudio?.();
      if (buses) {
        if (ak === 'master') buses.masterBus.gain.value = val;
        if (ak === 'music')  buses.musicBus.gain.value  = val;
        if (ak === 'vinyl')  buses.vinylGain.gain.value  = val;
      }
      const valEl = panel.querySelector(`[data-audio-val="${ak}"]`);
      if (valEl) valEl.textContent = val.toFixed(2);
    }
  });

  // ── Checkbox / radio change ───────────────────────────
  panel.addEventListener('change', e => {
    const k = e.target.dataset.key;
    if (e.target.type === 'checkbox' && k) {
      gfx[k] = e.target.checked;
    }
    if (e.target.name === 'qualityMode') {
      gfx.qualityMode = e.target.value;
      gfx.renderScale = deps.getRenderScale();
    }
  });

  // ── Click delegation ──────────────────────────────────
  panel.addEventListener('click', e => {
    if (e.target.id === 'gfx-close') {
      gfx.debug = false;
      panel.style.display = 'none';
      return;
    }

    if (e.target.id === 'gfx-reset') {
      Object.keys(DEFAULTS).forEach(k => {
        if (k === 'sources' || k === 'shadows' || k === 'wraps' || k === 'materials' || k === 'reflectionSources') {
          Object.assign(gfx[k], DEFAULTS[k]);
        } else {
          gfx[k] = DEFAULTS[k];
        }
      });
      gfx.renderScale = deps.getRenderScale();
      syncAllControls(panel, gfx);
      return;
    }

    const expBtn = e.target.closest('.gfx-export-btn');
    if (expBtn) {
      const layout = deps.getLayout?.()      || {};
      const hs     = deps.getHotspots?.()    || [];
      const guides = deps.getScaleGuides?.() || [];
      let text = '';
      if      (expBtn.id === 'gfx-exp-gfx')      text = buildGfxExport(gfx);
      else if (expBtn.id === 'gfx-exp-layout')    text = buildLayoutExport(layout);
      else if (expBtn.id === 'gfx-exp-hotspots')  text = buildHotspotsExport(hs);
      else if (expBtn.id === 'gfx-exp-scale')     text = buildScaleGuidesExport(guides);
      else if (expBtn.id === 'gfx-exp-all')       text = [buildGfxExport(gfx), buildLayoutExport(layout), buildHotspotsExport(hs), buildScaleGuidesExport(guides)].join('\n\n// ================================================\n\n');
      if (!text) return;
      console.log(text);
      const statusEl = panel.querySelector('#gfx-exp-status');
      const flashStatus = (msg, col) => {
        if (statusEl) { statusEl.textContent = msg; statusEl.style.color = col; }
        deps.showLabel?.('[ TUNING EXPORTED ]', '#80d8ff');
        setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
          () => flashStatus('✓ copied to clipboard', '#80ffb0'),
          () => flashStatus('logged to console',     '#ffb060')
        );
      } else {
        flashStatus('logged to console', '#ffb060');
      }
      return;
    }

    const prevBtn = e.target.closest('.gfx-preview-btn');
    if (prevBtn) {
      const pk = prevBtn.dataset.preview;
      const next = !gfx[pk];
      PREVIEW_KEYS.forEach(k => { gfx[k] = false; });
      panel.querySelectorAll('.gfx-preview-btn').forEach(b => b.classList.remove('on'));
      gfx[pk] = next;
      prevBtn.classList.toggle('on', next);
      return;
    }

    const chip = e.target.closest('.gfx-chip');
    if (chip) {
      const { obj, key: k } = chip.dataset;
      gfx[obj][k] = !gfx[obj][k];
      chip.classList.toggle('on', gfx[obj][k]);
      return;
    }

    const secHdr = e.target.closest('.gfx-sec-hdr');
    if (secHdr && !e.target.closest('.gfx-sec-btns')) {
      const body = panel.querySelector(`#gfx-b-${secHdr.dataset.sid}`);
      const chev = secHdr.querySelector('.gfx-chevron');
      if (body) {
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : '';
        if (chev) chev.textContent = open ? '▸' : '▾';
      }
    }
  });

  // ── Ctrl+Shift+G ─────────────────────────────────────
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
      gfx.debug = !gfx.debug;
      panel.style.display = gfx.debug ? 'flex' : 'none';
      e.preventDefault();
    }
  });

  function sync() {
    if (!gfx.debug) return;
    const fps = panel.querySelector('#gfx-fps');
    if (fps) fps.textContent = `${deps.getAvgFrameMs().toFixed(1)}ms`;
    const qlbl = panel.querySelector('#gfx-qlbl');
    if (qlbl) qlbl.textContent = deps.getQualityLabel();
    const res = panel.querySelector('#gfx-res');
    if (res) res.textContent = `${deps.getRenderWidth()}×${deps.getRenderHeight()}`;
    panel.querySelectorAll('[name=qualityMode]').forEach(r => { r.checked = r.value === gfx.qualityMode; });

    const buses = deps.getAudio?.();
    const audioStatus = panel.querySelector('#gfx-audio-status');
    if (audioStatus) audioStatus.textContent = buses ? 'RUNNING' : 'NOT INITIALISED';
    if (buses) {
      const syncAudioSlider = (key, val) => {
        const slider = panel.querySelector(`[data-audio-key="${key}"]`);
        if (slider && document.activeElement !== slider) slider.value = val.toFixed(2);
        const valEl = panel.querySelector(`[data-audio-val="${key}"]`);
        if (valEl) valEl.textContent = val.toFixed(2);
      };
      syncAudioSlider('master', buses.masterBus.gain.value);
      syncAudioSlider('music',  buses.musicBus.gain.value);
      syncAudioSlider('vinyl',  buses.vinylGain.gain.value);
    }
  }

  return { sync };
}
