// ── Hush OS Audio Engine ──────────────────────────────
// Lazy-init: AudioContext is only created on first hi-fi interaction.
// Bus topology:
//   vinylEl (HTMLAudioElement) → _mediaSource → vinylFadeGain → vinylGain → musicBus ┐
//                                                                         weatherBus  ├── masterBus → destination
//                                                                            cityBus  │
//                                                                           cyberBus  ┘
//
// vinylFadeGain : 0↔1 ramp owned by syncAudioToState (fade in/out + pause)
// vinylGain     : level knob exposed to the Audio Debug slider

// HTMLAudioElement created at module load so the browser can buffer the file.
// MediaElementSourceNode is created exactly once inside ensureAudioContext().
const vinylEl = new Audio('assets/music/vinyl-loop-01.wav');
vinylEl.loop    = true;
vinylEl.preload = 'auto';

let actx = null;

let masterBus   = null;
let musicBus    = null;
let weatherBus  = null;
let cityBus     = null;
let cyberBus    = null;

let vinylFadeGain = null;
let vinylGain     = null;
let _mediaSource  = null; // MediaElementSourceNode — never recreated

// _wantVinyl  : what syncAudioToState last requested (updated before actx check)
// _lastApplied: what was last applied to the audio graph (null = never)
// Keeping them separate prevents the dirty-check from swallowing the first post-init sync.
let _wantVinyl   = false;
let _lastApplied = null;

let _pauseTimeout = null; // handle for the post-fade-out pause

const FADE_IN_S  = 0.70; // seconds for volume-up ramp
const FADE_OUT_S = 0.45; // seconds for volume-down ramp (quick)

export function ensureAudioContext() {
  if (actx) {
    if (actx.state === 'suspended') actx.resume();
    return;
  }
  actx = new (window.AudioContext || window.webkitAudioContext)();

  masterBus  = actx.createGain(); masterBus.gain.value  = 0.85;
  musicBus   = actx.createGain(); musicBus.gain.value   = 0.80;
  weatherBus = actx.createGain(); weatherBus.gain.value = 0.70;
  cityBus    = actx.createGain(); cityBus.gain.value    = 0.50;
  cyberBus   = actx.createGain(); cyberBus.gain.value   = 0.60;

  musicBus.connect(masterBus);
  weatherBus.connect(masterBus);
  cityBus.connect(masterBus);
  cyberBus.connect(masterBus);
  masterBus.connect(actx.destination);

  vinylFadeGain = actx.createGain(); vinylFadeGain.gain.value = 0;
  vinylGain     = actx.createGain(); vinylGain.gain.value     = 0.80;
  vinylFadeGain.connect(vinylGain);
  vinylGain.connect(musicBus);

  // One-time wiring — createMediaElementSource may only be called once per element
  _mediaSource = actx.createMediaElementSource(vinylEl);
  _mediaSource.connect(vinylFadeGain);
}

function _fadeInVinyl() {
  // Cancel any pending post-fade-out pause so it doesn't silence a fresh fade-in
  if (_pauseTimeout !== null) { clearTimeout(_pauseTimeout); _pauseTimeout = null; }

  if (vinylEl.paused) {
    vinylEl.play().catch(e => console.warn('[hush audio] vinyl play failed:', e));
  }

  const now = actx.currentTime;
  const cur = vinylFadeGain.gain.value; // read before canceling to capture mid-ramp value
  vinylFadeGain.gain.cancelScheduledValues(now);
  vinylFadeGain.gain.setValueAtTime(cur, now);
  vinylFadeGain.gain.linearRampToValueAtTime(1, now + FADE_IN_S);
}

function _fadeOutVinyl() {
  if (_pauseTimeout !== null) { clearTimeout(_pauseTimeout); _pauseTimeout = null; }

  const now = actx.currentTime;
  const cur = vinylFadeGain.gain.value;
  vinylFadeGain.gain.cancelScheduledValues(now);
  vinylFadeGain.gain.setValueAtTime(cur, now);
  vinylFadeGain.gain.linearRampToValueAtTime(0, now + FADE_OUT_S);

  // Pause after the ramp completes — preserves currentTime for resume
  _pauseTimeout = setTimeout(() => {
    _pauseTimeout = null;
    if (!_wantVinyl) vinylEl.pause();
  }, Math.ceil(FADE_OUT_S * 1000) + 80);
}

export function syncAudioToState(state) {
  const want = !!(state.musicOn && state.musicSource === 'vinyl');
  _wantVinyl = want; // always update so _fadeInVinyl/_fadeOutVinyl see the latest intent

  if (!actx || !vinylFadeGain) return; // context not initialised yet

  if (want === _lastApplied) return; // no state change — nothing to do
  _lastApplied = want;

  if (want) _fadeInVinyl();
  else      _fadeOutVinyl();
}

// Returns bus/gain refs for the Audio Debug panel sliders; null before first interaction
export function getAudioBuses() {
  if (!actx) return null;
  return { masterBus, musicBus, weatherBus, cityBus, cyberBus, vinylGain };
}
