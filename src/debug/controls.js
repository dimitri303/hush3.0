export function setupDebugControls(deps) {
  const {
    gfx,
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
    getRenderScale,
    getQualityLabel
  } = deps;

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
      gfx.debug = !gfx.debug;
      e.preventDefault();
      return;
    }

    if (gfx.debug) {
      const k = e.key.toLowerCase();
      if (k === 'b') { gfx.bloom = !gfx.bloom; e.preventDefault(); return; }
      if (k === 'm') { gfx.bloomPreview = !gfx.bloomPreview; e.preventDefault(); return; }
      if (e.key === '[') { gfx.bloomStrength = Math.max(0, +(gfx.bloomStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.key === ']') { gfx.bloomStrength = Math.min(1.5, +(gfx.bloomStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.key === '-' || e.key === '_') { gfx.bloomBlur = Math.max(0, gfx.bloomBlur - 2); e.preventDefault(); return; }
      if (e.key === '=' || e.key === '+') { gfx.bloomBlur = Math.min(48, gfx.bloomBlur + 2); e.preventDefault(); return; }
      if (e.key === '1') { gfx.sources.city = !gfx.sources.city; e.preventDefault(); return; }
      if (e.key === '2') { gfx.sources.window = !gfx.sources.window; e.preventDefault(); return; }
      if (e.key === '3') { gfx.sources.tv = !gfx.sources.tv; e.preventDefault(); return; }
      if (e.key === '4') { gfx.sources.holo = !gfx.sources.holo; e.preventDefault(); return; }
      if (e.key === '5') { gfx.sources.hifi = !gfx.sources.hifi; e.preventDefault(); return; }
      if (k === 'c') { gfx.contactShadows = !gfx.contactShadows; e.preventDefault(); return; }
      if (k === 'v') { gfx.contactPreview = !gfx.contactPreview; e.preventDefault(); return; }
      if (e.key === ',') { gfx.contactStrength = Math.max(0, +(gfx.contactStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.key === '.') { gfx.contactStrength = Math.min(1.5, +(gfx.contactStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.key === '<') { gfx.aoStrength = Math.max(0, +(gfx.aoStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.key === '>') { gfx.aoStrength = Math.min(1.5, +(gfx.aoStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.key === '6') { gfx.shadows.chair = !gfx.shadows.chair; e.preventDefault(); return; }
      if (e.key === '7') { const v = !gfx.shadows.hifi; gfx.shadows.hifi = v; gfx.shadows.turntable = v; gfx.shadows.headphones = v; e.preventDefault(); return; }
      if (e.key === '8') { gfx.shadows.tv = !gfx.shadows.tv; e.preventDefault(); return; }
      if (e.key === '9') { const v = !gfx.shadows.table; gfx.shadows.table = v; gfx.shadows.mug = v; gfx.shadows.remote = v; gfx.shadows.books = v; gfx.shadows.holo = v; e.preventDefault(); return; }
      if (e.key === '0') { gfx.shadows.lamp = !gfx.shadows.lamp; e.preventDefault(); return; }
      if (k === 'a') { gfx.atmosphere = !gfx.atmosphere; e.preventDefault(); return; }
      if (k === 'n') { gfx.atmospherePreview = !gfx.atmospherePreview; e.preventDefault(); return; }
      if (k === 'j') { gfx.floorHazeStrength = Math.max(0, +(gfx.floorHazeStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'k') { gfx.floorHazeStrength = Math.min(1.5, +(gfx.floorHazeStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'u') { gfx.midHazeStrength = Math.max(0, +(gfx.midHazeStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'i') { gfx.midHazeStrength = Math.min(1.5, +(gfx.midHazeStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'o') { gfx.backFogStrength = Math.max(0, +(gfx.backFogStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'p') { gfx.backFogStrength = Math.min(1.5, +(gfx.backFogStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'r') { gfx.lightWrap = !gfx.lightWrap; e.preventDefault(); return; }
      if (k === 't') { gfx.lightWrapPreview = !gfx.lightWrapPreview; e.preventDefault(); return; }
      if (k === 'z') { gfx.wrapWindowStrength = Math.max(0, +(gfx.wrapWindowStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'x') { gfx.wrapWindowStrength = Math.min(1.5, +(gfx.wrapWindowStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'd') { gfx.wrapLampStrength = Math.max(0, +(gfx.wrapLampStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'f') { gfx.wrapLampStrength = Math.min(1.5, +(gfx.wrapLampStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'g') { gfx.wrapTvStrength = Math.max(0, +(gfx.wrapTvStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'h') { gfx.wrapTvStrength = Math.min(1.5, +(gfx.wrapTvStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'q') { gfx.wrapAmbientStrength = Math.max(0, +(gfx.wrapAmbientStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'w') { gfx.wrapAmbientStrength = Math.min(1.5, +(gfx.wrapAmbientStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (k === 'y') { const anyOff = Object.values(gfx.wraps).some((v) => !v); Object.keys(gfx.wraps).forEach((k2) => { gfx.wraps[k2] = anyOff; }); e.preventDefault(); return; }
      if (k === 'e' && !e.shiftKey) { gfx.materialResponse = !gfx.materialResponse; e.preventDefault(); return; }
      if (k === 'l') { gfx.materialPreview = !gfx.materialPreview; e.preventDefault(); return; }
      if (e.shiftKey && k === 'm') { gfx.materialStrength = Math.max(0, +(gfx.materialStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'n') { gfx.materialStrength = Math.min(1.5, +(gfx.materialStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'w') { gfx.woodSheenStrength = Math.max(0, +(gfx.woodSheenStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'e') { gfx.woodSheenStrength = Math.min(1.5, +(gfx.woodSheenStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'g') { gfx.glassSheenStrength = Math.max(0, +(gfx.glassSheenStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'h') { gfx.glassSheenStrength = Math.min(1.5, +(gfx.glassSheenStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 't') { gfx.metalGlintStrength = Math.max(0, +(gfx.metalGlintStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'y') { gfx.metalGlintStrength = Math.min(1.5, +(gfx.metalGlintStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'c') { gfx.leatherSheenStrength = Math.max(0, +(gfx.leatherSheenStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'v') { gfx.leatherSheenStrength = Math.min(1.5, +(gfx.leatherSheenStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'r') { gfx.reflections = !gfx.reflections; e.preventDefault(); return; }
      if (e.shiftKey && k === 'l') { gfx.reflectionsPreview = !gfx.reflectionsPreview; e.preventDefault(); return; }
      if (e.altKey && e.key === '1') { gfx.floorReflectionStrength = Math.max(0, +(gfx.floorReflectionStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '2') { gfx.floorReflectionStrength = Math.min(1.5, +(gfx.floorReflectionStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '3') { gfx.tableReflectionStrength = Math.max(0, +(gfx.tableReflectionStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '4') { gfx.tableReflectionStrength = Math.min(1.5, +(gfx.tableReflectionStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '5') { gfx.tvReflectionStrength = Math.max(0, +(gfx.tvReflectionStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '6') { gfx.tvReflectionStrength = Math.min(1.5, +(gfx.tvReflectionStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '7') { gfx.holoReflectionStrength = Math.max(0, +(gfx.holoReflectionStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '8') { gfx.holoReflectionStrength = Math.min(1.5, +(gfx.holoReflectionStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '9') { gfx.lampReflectionStrength = Math.max(0, +(gfx.lampReflectionStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '0') { gfx.lampReflectionStrength = Math.min(1.5, +(gfx.lampReflectionStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'g') { gfx.colourGrade = !gfx.colourGrade; e.preventDefault(); return; }
      if (e.shiftKey && k === 'p') { gfx.gradePreview = !gfx.gradePreview; e.preventDefault(); return; }
      if (e.altKey && k === 'q') { gfx.gradeStrength = Math.max(0, +(gfx.gradeStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'w') { gfx.gradeStrength = Math.min(1.5, +(gfx.gradeStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'a') { gfx.contrastStrength = Math.max(0, +(gfx.contrastStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 's') { gfx.contrastStrength = Math.min(1.5, +(gfx.contrastStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'z') { gfx.shadowTintStrength = Math.max(0, +(gfx.shadowTintStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'x') { gfx.shadowTintStrength = Math.min(1.5, +(gfx.shadowTintStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'c') { gfx.warmMidStrength = Math.max(0, +(gfx.warmMidStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'v') { gfx.warmMidStrength = Math.min(1.5, +(gfx.warmMidStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'b') { gfx.cyanLiftStrength = Math.max(0, +(gfx.cyanLiftStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'n') { gfx.cyanLiftStrength = Math.min(1.5, +(gfx.cyanLiftStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === ',') { gfx.vignetteStrength = Math.max(0, +(gfx.vignetteStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === '.') { gfx.vignetteStrength = Math.min(1.5, +(gfx.vignetteStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 's') { gfx.supersampling = !gfx.supersampling; e.preventDefault(); return; }
      if (e.altKey && e.key === '[') { gfx.supersampleScale = Math.max(1, +(gfx.supersampleScale - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === ']') { gfx.supersampleScale = Math.min(2, +(gfx.supersampleScale + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'o') { gfx.lensTreatment = !gfx.lensTreatment; e.preventDefault(); return; }
      if (e.shiftKey && k === 'i') { gfx.lensPreview = !gfx.lensPreview; e.preventDefault(); return; }
      if (e.shiftKey && k === 'v') { gfx.scanTexture = !gfx.scanTexture; e.preventDefault(); return; }
      if (e.altKey && k === 'g') { gfx.grainStrength = Math.max(0, +(gfx.grainStrength - 0.005).toFixed(3)); e.preventDefault(); return; }
      if (e.altKey && k === 'h') { gfx.grainStrength = Math.min(0.2, +(gfx.grainStrength + 0.005).toFixed(3)); e.preventDefault(); return; }
      if (e.altKey && k === 'j') { gfx.chromaStrength = Math.max(0, +(gfx.chromaStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'k') { gfx.chromaStrength = Math.min(1.5, +(gfx.chromaStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'y') { gfx.halationStrength = Math.max(0, +(gfx.halationStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'u') { gfx.halationStrength = Math.min(1.0, +(gfx.halationStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'm') { gfx.microMotion = !gfx.microMotion; e.preventDefault(); return; }
      if (e.altKey && k === 'm') { gfx.microMotionStrength = Math.max(0, +(gfx.microMotionStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'n') { gfx.microMotionStrength = Math.min(1.5, +(gfx.microMotionStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'e') { gfx.neonBreathStrength = Math.max(0, +(gfx.neonBreathStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'r') { gfx.neonBreathStrength = Math.min(1.5, +(gfx.neonBreathStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'd') { gfx.lampFlickerStrength = Math.max(0, +(gfx.lampFlickerStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'f') { gfx.lampFlickerStrength = Math.min(1.5, +(gfx.lampFlickerStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 't') { gfx.tvFlickerStrength = Math.max(0, +(gfx.tvFlickerStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'y') { gfx.tvFlickerStrength = Math.min(1.5, +(gfx.tvFlickerStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'u') { gfx.hazeDriftStrength = Math.max(0, +(gfx.hazeDriftStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'i') { gfx.hazeDriftStrength = Math.min(1.5, +(gfx.hazeDriftStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'o') { gfx.reflectionShimmerStrength = Math.max(0, +(gfx.reflectionShimmerStrength - 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'p') { gfx.reflectionShimmerStrength = Math.min(1.5, +(gfx.reflectionShimmerStrength + 0.05).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'd') { gfx.depthPolish = !gfx.depthPolish; e.preventDefault(); return; }
      if (e.shiftKey && k === 'b') { gfx.depthPreview = !gfx.depthPreview; e.preventDefault(); return; }
      if (e.altKey && k === 'd') { gfx.depthStrength = Math.max(0, +(gfx.depthStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'f') { gfx.depthStrength = Math.min(1.5, +(gfx.depthStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'z') { gfx.backgroundSoftness = Math.max(0, +(gfx.backgroundSoftness - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'x') { gfx.backgroundSoftness = Math.min(1.5, +(gfx.backgroundSoftness + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'c') { gfx.foregroundSoftness = Math.max(0, +(gfx.foregroundSoftness - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'v') { gfx.foregroundSoftness = Math.min(1.5, +(gfx.foregroundSoftness + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 'r') { gfx.midgroundClarity = Math.max(0, +(gfx.midgroundClarity - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && k === 't') { gfx.midgroundClarity = Math.min(1.5, +(gfx.midgroundClarity + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === '[') { gfx.depthVignetteStrength = Math.max(0, +(gfx.depthVignetteStrength - 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.altKey && e.key === ']') { gfx.depthVignetteStrength = Math.min(1.5, +(gfx.depthVignetteStrength + 0.02).toFixed(2)); e.preventDefault(); return; }
      if (e.shiftKey && k === 'q') {
        const modes = ['720p', '900p', '1080p'];
        gfx.qualityMode = modes[(modes.indexOf(gfx.qualityMode) + 1) % modes.length];
        gfx.renderScale = getRenderScale();
        if (typeof showLabel === 'function') showLabel(`[ ${getQualityLabel()} ]`, '#ffffa8', 1.2);
        e.preventDefault(); return;
      }
      if (e.key === 'F1') { gfx.qualityMode = '720p'; gfx.renderScale = getRenderScale(); if (typeof showLabel === 'function') showLabel('[ 720p Performance ]', '#ffffa8', 1.2); e.preventDefault(); return; }
      if (e.key === 'F2') { gfx.qualityMode = '900p'; gfx.renderScale = getRenderScale(); if (typeof showLabel === 'function') showLabel('[ 900p Balanced ]', '#ffffa8', 1.2); e.preventDefault(); return; }
      if (e.key === 'F3') { gfx.qualityMode = '1080p'; gfx.renderScale = getRenderScale(); if (typeof showLabel === 'function') showLabel('[ 1080p Quality ]', '#ffffa8', 1.2); e.preventDefault(); return; }
    }

    if (e.key === '`') {
      e.preventDefault();
      if (e.shiftKey) {
        setDebugScale(!getDebugScale());
        showLabel(getDebugScale() ? '[ SCALE GUIDE ON ]' : '[ SCALE GUIDE OFF ]', '#ffffa8', 1);
        return;
      }
      setDebugLayout(!getDebugLayout());
      console.log(`DEBUG_LAYOUT: ${getDebugLayout() ? 'ON' : 'OFF'}`);
      if (typeof showLabel === 'function') showLabel(getDebugLayout() ? '[ DEBUG LAYOUT ON ]' : '[ DEBUG LAYOUT OFF ]', '#ffffa8', 1);
      return;
    }

    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      setDebugScale(!getDebugScale());
      showLabel(getDebugScale() ? '[ SCALE GUIDE ON ]' : '[ SCALE GUIDE OFF ]', '#ffffa8', 1);
      return;
    }

    if (getDebugScale()) {
      const g = scaleGuides[getScaleGuideIndex()];
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'Tab') { e.preventDefault(); setScaleGuideIndex((getScaleGuideIndex() + 1) % scaleGuides.length); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); g.x -= step; return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); g.x += step; return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); g.floorY -= step; return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); g.floorY += step; return; }
      if (e.key === '+' || e.key === '=') { g.scale = Math.min(2.5, +(g.scale + 0.01).toFixed(2)); return; }
      if (e.key === '-') { g.scale = Math.max(0.3, +(g.scale - 0.01).toFixed(2)); return; }
    }

    if (!getDebugLayout()) return;
    const currentTarget = getDebugTarget();
    const r = getDebugRect(currentTarget);
    if (!r) return;

    const isArrow = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
    const step = e.altKey ? 10 : 1;

    if (e.key === 'Tab') {
      e.preventDefault();
      const i = debugTargets.indexOf(currentTarget);
      const nextTarget = debugTargets[(i + 1) % debugTargets.length];
      setDebugTarget(nextTarget);
      console.log('Debug target:', nextTarget, getDebugRect(nextTarget));
      return;
    }

    if (e.key === 'c' || e.key === 'C') {
      const activeTarget = getDebugTarget();
      const v = getDebugRect(activeTarget);
      const output = formatDebugLine(activeTarget, v);
      console.log(output);
      if (navigator.clipboard) navigator.clipboard.writeText(output).catch(() => {});
      if (typeof showLabel === 'function') showLabel(`[ COPIED ${activeTarget} ]`, '#ffffa8', 0.8);
      return;
    }

    if (!isArrow) return;
    e.preventDefault();
    const resize = e.shiftKey && r.w != null && r.h != null;
    if (!resize) {
      if (e.key === 'ArrowLeft') r.x -= step;
      if (e.key === 'ArrowRight') r.x += step;
      if (e.key === 'ArrowUp') r.y -= step;
      if (e.key === 'ArrowDown') r.y += step;
    } else {
      if (e.key === 'ArrowLeft') r.w -= step;
      if (e.key === 'ArrowRight') r.w += step;
      if (e.key === 'ArrowUp') r.h -= step;
      if (e.key === 'ArrowDown') r.h += step;
      r.w = Math.max(1, r.w);
      r.h = Math.max(1, r.h);
    }
  });
}
