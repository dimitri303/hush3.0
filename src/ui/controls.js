export function setupUiControls(deps) {
  const {
    canvas,
    RW,
    RH,
    state,
    UI,
    tracks,
    hitTest,
    setFocus,
    updateUiState,
    showLabel
  } = deps;

  canvas.addEventListener('mousemove', (e) => {
    state.hover = hitTest(e.clientX, e.clientY);
    canvas.style.cursor = state.hover ? 'pointer' : 'default';
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / RW;
    state.mx = ((e.clientX - rect.left) / scale / RW) * 2 - 1;
    state.my = ((e.clientY - rect.top) / scale / RH) * 2 - 1;
  });

  canvas.addEventListener('click', (e) => {
    const hit = hitTest(e.clientX, e.clientY);
    if (!hit) {
      if (state.focus) setFocus(null);
      return;
    }

    if (hit.id === 'lamp') {
      state.lampOn = !state.lampOn;
      showLabel(state.lampOn ? '[ LAMP ON ]' : '[ LAMP OFF ]', '#ffe2bb');
      return;
    }

    if (state.focus === hit.id) {
      if (hit.id === 'tv') {
        state.tvCh = (state.tvCh + 1) % 2;
        updateUiState();
        showLabel(state.tvCh === 0 ? '[ AMBIENT ]' : '[ ANIME ]', '#b4f2ff');
        return;
      }
      if (hit.id === 'hifi') {
        const seq = ['vinyl', 'spotify', 'radio'];
        const i = seq.indexOf(state.musicSource);
        state.musicSource = seq[(i + 1) % seq.length];
        state.musicOn = true;
        updateUiState();
        showLabel(`[ ${state.musicSource.toUpperCase()} ]`, '#ffd8ff');
        return;
      }
      if (hit.id === 'holo') {
        const moods = ['calm', 'rain', 'neon', 'midnight'];
        const i = moods.indexOf(state.mood);
        state.mood = moods[(i + 1) % moods.length];
        state.holoPulse = 1;
        updateUiState();
        showLabel(`[ ${state.mood.toUpperCase()} ]`, '#d8c2ff');
        return;
      }
    }
    setFocus(hit.id);
  });

  UI.back.addEventListener('click', () => setFocus(null));
  UI.clock.addEventListener('click', () => UI.timeUi.classList.toggle('show'));

  document.querySelectorAll('[data-time]').forEach((el) => {
    el.addEventListener('click', () => {
      const mode = el.dataset.time;
      UI.timeUi.classList.remove('show');
      if (mode === 'cycle') {
        state.timeMode = 'auto';
        state.timeCycle = true;
        state.cycleAt = performance.now();
        state.cycleMinutesBase = state.currentMinutes;
      } else if (mode === 'auto') {
        state.timeMode = 'auto';
        state.timeCycle = false;
      } else {
        state.timeMode = mode;
        state.timeCycle = false;
      }
      showLabel(`[ ${mode.toUpperCase()} ]`, '#b4f2ff');
    });
  });

  document.querySelectorAll('[data-source]').forEach((el) => el.addEventListener('click', () => {
    state.musicSource = el.dataset.source;
    state.musicOn = true;
    updateUiState();
  }));
  UI.musicPow.addEventListener('click', () => { state.musicOn = !state.musicOn; updateUiState(); });
  UI.musicPlay.addEventListener('click', () => { state.musicOn = !state.musicOn; updateUiState(); });
  UI.musicPrev.addEventListener('click', () => { state.musicTrack = (state.musicTrack + tracks.length - 1) % tracks.length; state.holoPulse = 1; });
  UI.musicNext.addEventListener('click', () => { state.musicTrack = (state.musicTrack + 1) % tracks.length; state.holoPulse = 1; });

  document.querySelectorAll('[data-tvch]').forEach((el) => el.addEventListener('click', () => { state.tvCh = +el.dataset.tvch; updateUiState(); }));
  UI.tvPow.addEventListener('click', () => { state.tvOn = !state.tvOn; updateUiState(); });
  UI.winToggle.addEventListener('click', () => { state.winOpen = !state.winOpen; updateUiState(); showLabel(state.winOpen ? '[ WINDOW OPEN ]' : '[ WINDOW CLOSED ]', '#c7f0ff'); });
  UI.winLean.addEventListener('click', () => { state.leanOut = !state.leanOut; updateUiState(); showLabel(state.leanOut ? '[ LEAN OUT ]' : '[ STEP BACK ]', '#c7f0ff'); });

  document.querySelectorAll('[data-weather]').forEach((el) => el.addEventListener('click', () => {
    const key = el.dataset.weather;
    const wasActive = state.weather[key];
    Object.keys(state.weather).forEach((k) => { state.weather[k] = false; });
    if (!wasActive) {
      state.weather[key] = true;
      showLabel(`[ ${key.toUpperCase()} ]`, '#c7f0ff');
    } else {
      showLabel('[ CLEAR ]', '#c7f0ff');
    }
    updateUiState();
  }));

  document.querySelectorAll('[data-mood]').forEach((el) => el.addEventListener('click', () => {
    state.mood = el.dataset.mood;
    state.holoPulse = 1;
    updateUiState();
    showLabel(`[ ${state.mood.toUpperCase()} ]`, '#d8c2ff');
  }));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.focus) {
      e.preventDefault();
      setFocus(null);
    }
  });
}
