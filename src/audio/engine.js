// ── Hush OS Audio Engine ──────────────────────────────
// Lazy-init: AudioContext only created on first audio interaction.
//
// Bus topology:
//   vinylEl     → vinylMediaSrc  → vinylFadeGain     → vinylGain      → musicBus   ┐
//   lightRainEl → rainMediaSrc   → lightRainFilter                                  │
//                               → lightRainFadeGain  → lightRainGain  → weatherBus ├── masterBus → destination
//                                                                        cityBus    │
//                                                                        cyberBus   ┘
//
// *FadeGain nodes  : owned by syncAudioToState — drive on/off ramps and pause logic
// *Gain nodes      : level knobs exposed to the Audio Debug panel sliders
// lightRainFilter  : lowpass — frequency ramps with window open/closed state

// ── Audio elements (created at module load for early buffering) ───────────────
const vinylEl = new Audio('assets/music/vinyl-loop-01.wav');
vinylEl.loop    = true;
vinylEl.preload = 'auto';

const lightRainEl = new Audio('assets/ambience/light-rain.mp3');
lightRainEl.loop    = true;
lightRainEl.preload = 'auto';

// ── Node refs ─────────────────────────────────────────
let actx = null;

let masterBus   = null;
let musicBus    = null;
let weatherBus  = null;
let cityBus     = null;
let cyberBus    = null;

let vinylFadeGain  = null;
let vinylGain      = null;
let _vinylSrc      = null; // MediaElementSourceNode — created once only

let lightRainFilter   = null;
let lightRainFadeGain = null;
let lightRainGain     = null;
let _rainSrc          = null; // MediaElementSourceNode — created once only

// ── State tracking ────────────────────────────────────
// _want*       : desired state, updated before actx guard so it survives lazy init
// _lastApplied*: last state actually written to the audio graph (null = never applied)
let _wantVinyl        = false;
let _lastAppliedVinyl = null;
let _vinylPause       = null; // setTimeout handle

let _wantRain        = false;
let _lastAppliedRain = null;
let _lastWinOpen     = null;
let _rainPause       = null; // setTimeout handle

// ── Constants ─────────────────────────────────────────
const VINYL_IN_S  = 0.70;
const VINYL_OUT_S = 0.45;

const RAIN_IN_S      = 1.20;
const RAIN_OUT_S     = 0.80;
const RAIN_WIN_RAMP  = 1.50; // window open/close cross-fade

const RAIN_GAIN_CLOSED = 0.40;
const RAIN_GAIN_OPEN   = 0.90;
const RAIN_FREQ_CLOSED = 900;
const RAIN_FREQ_OPEN   = 6000;

// ── Init ──────────────────────────────────────────────

export function ensureAudioContext() {
  if (actx) {
    if (actx.state === 'suspended') actx.resume();
    return;
  }
  actx = new (window.AudioContext || window.webkitAudioContext)();

  masterBus  = actx.createGain(); masterBus.gain.value  = 0.85;
  musicBus   = actx.createGain(); musicBus.gain.value   = 0.80;
  weatherBus = actx.createGain(); weatherBus.gain.value = 1.15;
  cityBus    = actx.createGain(); cityBus.gain.value    = 0.50;
  cyberBus   = actx.createGain(); cyberBus.gain.value   = 0.60;

  musicBus.connect(masterBus);
  weatherBus.connect(masterBus);
  cityBus.connect(masterBus);
  cyberBus.connect(masterBus);
  masterBus.connect(actx.destination);

  // ── Vinyl chain ───────────────────────────────────
  vinylFadeGain = actx.createGain(); vinylFadeGain.gain.value = 0;
  vinylGain     = actx.createGain(); vinylGain.gain.value     = 0.80;
  _vinylSrc = actx.createMediaElementSource(vinylEl); // one-time — never recreated
  _vinylSrc.connect(vinylFadeGain);
  vinylFadeGain.connect(vinylGain);
  vinylGain.connect(musicBus);

  // ── Light rain chain ──────────────────────────────
  lightRainFilter = actx.createBiquadFilter();
  lightRainFilter.type            = 'lowpass';
  lightRainFilter.frequency.value = RAIN_FREQ_CLOSED; // default: window closed
  lightRainFilter.Q.value         = 0.7;

  lightRainFadeGain = actx.createGain(); lightRainFadeGain.gain.value = 0;
  lightRainGain     = actx.createGain(); lightRainGain.gain.value     = 1.0;

  _rainSrc = actx.createMediaElementSource(lightRainEl); // one-time — never recreated
  _rainSrc.connect(lightRainFilter);
  lightRainFilter.connect(lightRainFadeGain);
  lightRainFadeGain.connect(lightRainGain);
  lightRainGain.connect(weatherBus);
}

// ── Vinyl helpers ─────────────────────────────────────

function _fadeInVinyl() {
  if (_vinylPause !== null) { clearTimeout(_vinylPause); _vinylPause = null; }
  if (vinylEl.paused) vinylEl.play().catch(e => console.warn('[hush audio] vinyl play:', e));
  const now = actx.currentTime;
  const cur = vinylFadeGain.gain.value; // capture mid-ramp value before canceling
  vinylFadeGain.gain.cancelScheduledValues(now);
  vinylFadeGain.gain.setValueAtTime(cur, now);
  vinylFadeGain.gain.linearRampToValueAtTime(1, now + VINYL_IN_S);
}

function _fadeOutVinyl() {
  if (_vinylPause !== null) { clearTimeout(_vinylPause); _vinylPause = null; }
  const now = actx.currentTime;
  const cur = vinylFadeGain.gain.value;
  vinylFadeGain.gain.cancelScheduledValues(now);
  vinylFadeGain.gain.setValueAtTime(cur, now);
  vinylFadeGain.gain.linearRampToValueAtTime(0, now + VINYL_OUT_S);
  _vinylPause = setTimeout(() => {
    _vinylPause = null;
    if (!_wantVinyl) vinylEl.pause(); // preserves currentTime
  }, Math.ceil(VINYL_OUT_S * 1000) + 80);
}

// ── Rain helpers ──────────────────────────────────────

function _fadeInRain(targetGain, filterFreq) {
  if (_rainPause !== null) { clearTimeout(_rainPause); _rainPause = null; }
  const now = actx.currentTime;
  if (lightRainEl.paused) {
    // Starting from silence — snap filter to target (inaudible at gain=0) then play
    lightRainFilter.frequency.cancelScheduledValues(now);
    lightRainFilter.frequency.setValueAtTime(filterFreq, now);
    lightRainEl.play().catch(e => console.warn('[hush audio] rain play:', e));
  } else {
    // Recovering mid-fade-out — ramp filter smoothly instead of snapping
    const curFreq = lightRainFilter.frequency.value;
    lightRainFilter.frequency.cancelScheduledValues(now);
    lightRainFilter.frequency.setValueAtTime(Math.max(curFreq, 1), now);
    lightRainFilter.frequency.exponentialRampToValueAtTime(filterFreq, now + RAIN_IN_S);
  }
  const cur = lightRainFadeGain.gain.value;
  lightRainFadeGain.gain.cancelScheduledValues(now);
  lightRainFadeGain.gain.setValueAtTime(cur, now);
  lightRainFadeGain.gain.linearRampToValueAtTime(targetGain, now + RAIN_IN_S);
}

function _fadeOutRain() {
  if (_rainPause !== null) { clearTimeout(_rainPause); _rainPause = null; }
  const now = actx.currentTime;
  const cur = lightRainFadeGain.gain.value;
  lightRainFadeGain.gain.cancelScheduledValues(now);
  lightRainFadeGain.gain.setValueAtTime(cur, now);
  lightRainFadeGain.gain.linearRampToValueAtTime(0, now + RAIN_OUT_S);
  _rainPause = setTimeout(() => {
    _rainPause = null;
    if (!_wantRain) lightRainEl.pause(); // preserves currentTime
  }, Math.ceil(RAIN_OUT_S * 1000) + 80);
}

function _adjustRainWindow(targetGain, filterFreq) {
  if (_rainPause !== null) return; // fading out — skip; correct state applied on next fade-in
  const now = actx.currentTime;
  const curGain = lightRainFadeGain.gain.value;
  lightRainFadeGain.gain.cancelScheduledValues(now);
  lightRainFadeGain.gain.setValueAtTime(curGain, now);
  lightRainFadeGain.gain.linearRampToValueAtTime(targetGain, now + RAIN_WIN_RAMP);
  const curFreq = lightRainFilter.frequency.value;
  lightRainFilter.frequency.cancelScheduledValues(now);
  lightRainFilter.frequency.setValueAtTime(Math.max(curFreq, 1), now);
  lightRainFilter.frequency.exponentialRampToValueAtTime(filterFreq, now + RAIN_WIN_RAMP);
}

// ── Central sync (called from updateUiState on every state change) ────────────

export function syncAudioToState(state) {
  // ── Vinyl ──
  const wantVinyl = !!(state.musicOn && state.musicSource === 'vinyl');
  _wantVinyl = wantVinyl;
  if (actx && vinylFadeGain && wantVinyl !== _lastAppliedVinyl) {
    _lastAppliedVinyl = wantVinyl;
    if (wantVinyl) _fadeInVinyl();
    else           _fadeOutVinyl();
  }

  // ── Light rain ──
  const wantRain   = !!(state.weather.rain || state.weather.thunderstorm);
  const winOpen    = !!state.winOpen;
  const rainTarget = winOpen ? RAIN_GAIN_OPEN   : RAIN_GAIN_CLOSED;
  const filterFreq = winOpen ? RAIN_FREQ_OPEN   : RAIN_FREQ_CLOSED;

  _wantRain = wantRain;
  if (actx && lightRainFadeGain) {
    const rainChanged   = wantRain !== _lastAppliedRain;
    const windowChanged = winOpen  !== _lastWinOpen;
    _lastWinOpen = winOpen;

    if (rainChanged) {
      _lastAppliedRain = wantRain;
      if (wantRain) _fadeInRain(rainTarget, filterFreq);
      else          _fadeOutRain();
    } else if (wantRain && windowChanged) {
      // Rain is playing and window state changed — smooth cross-ramp
      _adjustRainWindow(rainTarget, filterFreq);
    }
  }
}

// ── Debug panel access ────────────────────────────────

export function getAudioBuses() {
  if (!actx) return null;
  return { masterBus, musicBus, weatherBus, cityBus, cyberBus, vinylGain, lightRainGain };
}

// ── Music analyser tap (speaker visualiser) ───────────────────────
// Connects a parallel AnalyserNode to musicBus on first call.
// Does not interrupt the signal chain — purely a read tap.

let _musicAnalyser = null;

export function getMusicAnalyser() {
  if (!actx || !musicBus) return null;
  if (!_musicAnalyser) {
    _musicAnalyser = actx.createAnalyser();
    _musicAnalyser.fftSize               = 1024;
    _musicAnalyser.smoothingTimeConstant = 0.72;  // lower than masterBus smoothing so treble transients survive
    musicBus.connect(_musicAnalyser);  // parallel tap — playback unaffected
  }
  return _musicAnalyser;
}
