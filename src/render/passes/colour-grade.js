export function createColourGradePass(deps) {
  const {
    gfx,
    RW,
    RH,
    grx,
    gradeCanvas,
    cx,
    configurePassCanvas,
    resetPassContext,
    timeProfile
  } = deps;

  function clearGradeCanvas() {
    configurePassCanvas(gradeCanvas);
    grx.setTransform(1, 0, 0, 1, 0, 0);
    grx.clearRect(0, 0, gradeCanvas.width, gradeCanvas.height);
    resetPassContext(grx);
  }

  function drawGradeFullGradient(ctx, stops, blend, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = blend;
    ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(0, 0, 0, RH);
    stops.forEach(([p, c]) => g.addColorStop(p, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, RW, RH);
    ctx.restore();
  }

  function drawGradeRadial(ctx, x, y, r0, r1, stops, blend, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = blend;
    ctx.globalAlpha = alpha;
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([p, c]) => g.addColorStop(p, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, RW, RH);
    ctx.restore();
  }

  function drawGradeShadowTint(ctx) {
    if (gfx.shadowTintStrength <= 0) return;
    const tp = timeProfile();
    const nightMul = 0.75 + tp.night * 0.45;
    const s = gfx.gradeStrength * gfx.shadowTintStrength * nightMul;
    drawGradeFullGradient(ctx, [
      [0.00, 'rgba(60,35,95,0)'],
      [0.35, `rgba(48,28,78,${0.07 * s})`],
      [0.72, `rgba(38,20,65,${0.15 * s})`],
      [1.00, `rgba(18,8,32,${0.18 * s})`]
    ], 'multiply', 1);
    drawGradeRadial(ctx, RW * 0.48, RH * 0.58, RW * 0.10, RW * 0.70, [
      [0.00, `rgba(120,45,160,${0.035 * s})`],
      [0.55, `rgba(80,20,120,${0.022 * s})`],
      [1.00, 'rgba(80,20,120,0)']
    ], 'screen', 1);
  }

  function drawGradeWarmMidtones(ctx) {
    if (gfx.warmMidStrength <= 0) return;
    const tp = timeProfile();
    const sunsetWarm = 0.8 + tp.sunset * 0.45;
    const s = gfx.gradeStrength * gfx.warmMidStrength * sunsetWarm;
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    drawGradeRadial(ctx, RW * 0.44, RH * 0.70, 0, RW * 0.46, [
      [0.00, `rgba(255,160,80,${0.10 * s})`],
      [0.42, `rgba(255,120,60,${0.042 * s})`],
      [1.00, 'rgba(255,120,60,0)']
    ], 'screen', 1);
    const g = ctx.createLinearGradient(0, RH * 0.55, 0, RH);
    g.addColorStop(0, 'rgba(255,180,100,0)');
    g.addColorStop(0.55, `rgba(255,160,90,${0.026 * s})`);
    g.addColorStop(1, `rgba(255,130,70,${0.018 * s})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, RH * 0.52, RW, RH * 0.48);
    ctx.restore();
  }

  function drawGradeCyanLift(ctx) {
    if (gfx.cyanLiftStrength <= 0) return;
    const tp = timeProfile();
    const nightMul = 0.75 + tp.night * 0.45;
    const s = gfx.gradeStrength * gfx.cyanLiftStrength * nightMul;
    drawGradeRadial(ctx, RW * 0.68, RH * 0.48, 0, RW * 0.55, [
      [0.00, `rgba(80,190,255,${0.08 * s})`],
      [0.45, `rgba(70,140,255,${0.030 * s})`],
      [1.00, 'rgba(70,140,255,0)']
    ], 'screen', 1);
  }

  function drawGradeContrast(ctx) {
    if (gfx.contrastStrength <= 0) return;
    const s = gfx.gradeStrength * gfx.contrastStrength;
    drawGradeFullGradient(ctx, [
      [0.00, `rgba(0,0,0,${0.16 * s})`],
      [0.18, `rgba(0,0,0,${0.04 * s})`],
      [0.50, 'rgba(0,0,0,0)'],
      [0.82, `rgba(0,0,0,${0.04 * s})`],
      [1.00, `rgba(0,0,0,${0.14 * s})`]
    ], 'multiply', 1);
    drawGradeRadial(ctx, RW * 0.52, RH * 0.54, 0, RW * 0.62, [
      [0.00, `rgba(255,245,235,${0.028 * s})`],
      [0.45, `rgba(255,245,235,${0.009 * s})`],
      [1.00, 'rgba(255,245,235,0)']
    ], 'screen', 1);
  }

  function drawGradeVignette(ctx) {
    if (gfx.vignetteStrength <= 0) return;
    const tp = timeProfile();
    const nightMul = 0.8 + tp.night * 0.25;
    const strength = gfx.gradeStrength * gfx.vignetteStrength * nightMul;
    const size = gfx.vignetteSize || 0.72;
    const cx0 = RW * 0.50; const cy0 = RH * 0.52;
    const inner = Math.min(RW, RH) * size * 0.35;
    const outer = Math.max(RW, RH) * size;
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createRadialGradient(cx0, cy0, inner, cx0, cy0, outer);
    g.addColorStop(0.00, 'rgba(0,0,0,0)');
    g.addColorStop(0.55, `rgba(0,0,0,${0.07 * strength})`);
    g.addColorStop(0.82, `rgba(0,0,0,${0.18 * strength})`);
    g.addColorStop(1.00, `rgba(0,0,0,${0.36 * strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, RW, RH);
    ctx.restore();
  }

  function renderColourGradePass() {
    clearGradeCanvas();
    if (!gfx.gradePreview) return;
    drawGradeShadowTint(grx);
    drawGradeWarmMidtones(grx);
    drawGradeCyanLift(grx);
    drawGradeContrast(grx);
    drawGradeVignette(grx);
  }

  function compositeColourGrade() {
    if (!gfx.colourGrade) return;
    drawGradeShadowTint(cx);
    drawGradeWarmMidtones(cx);
    drawGradeCyanLift(cx);
    drawGradeContrast(cx);
    drawGradeVignette(cx);
  }

  return { renderColourGradePass, compositeColourGrade };
}
