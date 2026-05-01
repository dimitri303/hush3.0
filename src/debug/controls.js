export function setupDebugControls(deps) {
  const {
    scaleGuides,
    debugTargets,
    getDebugLayout,
    setDebugLayout,
    getDebugScale,
    setDebugScale,
    getDebugTarget,
    setDebugTarget,
    getScaleGuideIndex,
    setScaleGuideIndex,
    getDebugRect,
    formatDebugLine,
    showLabel,
  } = deps;

  window.addEventListener('keydown', (e) => {
    // Backtick — toggle layout overlay
    if (e.key === '`') {
      e.preventDefault();
      if (e.shiftKey) {
        setDebugScale(!getDebugScale());
        showLabel(getDebugScale() ? '[ SCALE GUIDE ON ]' : '[ SCALE GUIDE OFF ]', '#ffffa8', 1);
        return;
      }
      setDebugLayout(!getDebugLayout());
      if (typeof showLabel === 'function')
        showLabel(getDebugLayout() ? '[ DEBUG LAYOUT ON ]' : '[ DEBUG LAYOUT OFF ]', '#ffffa8', 1);
      return;
    }

    // P — toggle scale guide
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      setDebugScale(!getDebugScale());
      showLabel(getDebugScale() ? '[ SCALE GUIDE ON ]' : '[ SCALE GUIDE OFF ]', '#ffffa8', 1);
      return;
    }

    // Scale guide arrow controls
    if (getDebugScale()) {
      const g = scaleGuides[getScaleGuideIndex()];
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'Tab')        { e.preventDefault(); setScaleGuideIndex((getScaleGuideIndex() + 1) % scaleGuides.length); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); g.x -= step; return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); g.x += step; return; }
      if (e.key === 'ArrowUp')    { e.preventDefault(); g.floorY -= step; return; }
      if (e.key === 'ArrowDown')  { e.preventDefault(); g.floorY += step; return; }
      if (e.key === '+' || e.key === '=') { g.scale = Math.min(2.5, +(g.scale + 0.01).toFixed(2)); return; }
      if (e.key === '-')          { g.scale = Math.max(0.3, +(g.scale - 0.01).toFixed(2)); return; }
    }

    // Layout debug arrow / tab controls
    if (!getDebugLayout()) return;
    const currentTarget = getDebugTarget();
    const r = getDebugRect(currentTarget);
    if (!r) return;

    const step = e.altKey ? 10 : 1;

    if (e.key === 'Tab') {
      e.preventDefault();
      const i = debugTargets.indexOf(currentTarget);
      setDebugTarget(debugTargets[(i + 1) % debugTargets.length]);
      console.log('Debug target:', getDebugTarget(), getDebugRect(getDebugTarget()));
      return;
    }

    if (e.key === 'c' || e.key === 'C') {
      const v = getDebugRect(getDebugTarget());
      const output = formatDebugLine(getDebugTarget(), v);
      console.log(output);
      if (navigator.clipboard) navigator.clipboard.writeText(output).catch(() => {});
      if (typeof showLabel === 'function') showLabel(`[ COPIED ${getDebugTarget()} ]`, '#ffffa8', 0.8);
      return;
    }

    const isArrow = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key);
    if (!isArrow) return;
    e.preventDefault();
    const resize = e.shiftKey && r.w != null && r.h != null;
    if (!resize) {
      if (e.key === 'ArrowLeft')  r.x -= step;
      if (e.key === 'ArrowRight') r.x += step;
      if (e.key === 'ArrowUp')    r.y -= step;
      if (e.key === 'ArrowDown')  r.y += step;
    } else {
      if (e.key === 'ArrowLeft')  r.w -= step;
      if (e.key === 'ArrowRight') r.w += step;
      if (e.key === 'ArrowUp')    r.h -= step;
      if (e.key === 'ArrowDown')  r.h += step;
      r.w = Math.max(1, r.w);
      r.h = Math.max(1, r.h);
    }
  });
}
