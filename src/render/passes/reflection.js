export function createReflectionPass(deps) {
  const {
    gfx,
    state,
    layout,
    RW,
    RH,
    rx,
    reflectionCanvas,
    cx,
    configurePassCanvas,
    resetPassContext,
    microEnabled,
    micro
  } = deps;

  const REF_SCALE = 0.40;

  function clearReflectionCanvas() {
    configurePassCanvas(reflectionCanvas);
    rx.setTransform(1, 0, 0, 1, 0, 0);
    rx.clearRect(0, 0, reflectionCanvas.width, reflectionCanvas.height);
    resetPassContext(rx);
  }

  function drawReflectionBlob(ctx, x, y, w, h, colour, alpha = 0.12, blur = 18, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.filter = `blur(${blur}px)`;
    const a = alpha * REF_SCALE;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) * 0.5);
    g.addColorStop(0, colour.replace('__A__', a.toFixed(3)));
    g.addColorStop(0.38, colour.replace('__A__', (a * 0.45).toFixed(3)));
    g.addColorStop(1, colour.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.scale(w / Math.max(w, h), h / Math.max(w, h));
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(w, h) * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawReflectionStreak(ctx, x, y, w, h, colour, alpha = 0.10, blur = 10, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.filter = `blur(${blur}px)`;
    const a = alpha * REF_SCALE;
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, colour.replace('__A__', '0'));
    g.addColorStop(0.28, colour.replace('__A__', (a * 0.30).toFixed(3)));
    g.addColorStop(0.5, colour.replace('__A__', a.toFixed(3)));
    g.addColorStop(0.72, colour.replace('__A__', (a * 0.30).toFixed(3)));
    g.addColorStop(1, colour.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function drawSurfaceSheen(ctx, x, y, w, h, colour, alpha = 0.10, blur = 8, angle = 0) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle);
    ctx.filter = `blur(${blur}px)`;
    const a = alpha * REF_SCALE;
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, colour.replace('__A__', '0'));
    g.addColorStop(0.35, colour.replace('__A__', (a * 0.35).toFixed(3)));
    g.addColorStop(0.52, colour.replace('__A__', a.toFixed(3)));
    g.addColorStop(0.70, colour.replace('__A__', (a * 0.25).toFixed(3)));
    g.addColorStop(1, colour.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function drawFloorWindowReflection() {
    if (!gfx.reflectionSources.window && !gfx.reflectionSources.city) return;
    const s = gfx.floorReflectionStrength;
    const rm = microEnabled() ? micro.reflectionShimmer : 1;
    rx.save(); rx.globalCompositeOperation = 'screen';
    drawReflectionBlob(rx, 980, 860, 760, 150, 'rgba(175,95,255,__A__)', 0.13 * s * rm, 28, -0.02);
    drawReflectionBlob(rx, 1080, 900, 560, 90, 'rgba(90,180,255,__A__)', 0.08 * s * rm, 24, 0.03);
    drawReflectionStreak(rx, 650, 830, 260, 34, 'rgba(180,105,255,__A__)', 0.08 * s * rm, 18, -0.12);
    drawReflectionStreak(rx, 1280, 825, 260, 34, 'rgba(180,105,255,__A__)', 0.08 * s * rm, 18, 0.10);
    rx.restore();
  }

  function drawFloorTvReflection() {
    if (!gfx.reflectionSources.tv || !state.tvOn) return;
    const s = gfx.tvReflectionStrength;
    const sc = layout.screen;
    const x = sc.x + sc.w * 0.5; const y = sc.y + sc.h + 160;
    rx.save(); rx.globalCompositeOperation = 'screen';
    drawReflectionBlob(rx, x, y, 300, 80, 'rgba(110,160,255,__A__)', 0.18 * s, 20, 0.02);
    drawReflectionStreak(rx, x - 20, y + 42, 220, 18, 'rgba(145,190,255,__A__)', 0.11 * s, 12, -0.03);
    rx.restore();
  }

  function drawFloorLampReflection() {
    if (!gfx.reflectionSources.lamp || !state.lampOn) return;
    const s = gfx.lampReflectionStrength;
    const lm = microEnabled() ? micro.lampWarmth : 1;
    const p = layout.lampTarget || { x: 582, y: 715 };
    rx.save(); rx.globalCompositeOperation = 'screen';
    drawReflectionBlob(rx, p.x + 70, p.y + 85, 310, 92, 'rgba(255,175,95,__A__)', 0.13 * s * lm, 22, -0.10);
    drawReflectionStreak(rx, p.x + 150, p.y + 118, 230, 20, 'rgba(255,190,115,__A__)', 0.09 * s * lm, 12, -0.08);
    rx.restore();
  }

  function drawTableReflections() {
    const r = layout.table;
    const s = gfx.tableReflectionStrength;
    rx.save(); rx.globalCompositeOperation = 'screen';
    if (gfx.reflectionSources.window || gfx.reflectionSources.city) {
      drawSurfaceSheen(rx, r.x + r.w * 0.17, r.y + r.h * 0.40, r.w * 0.58, 28, 'rgba(160,135,255,__A__)', 0.10 * s, 9, -0.04);
    }
    if (gfx.reflectionSources.lamp && state.lampOn) {
      drawSurfaceSheen(rx, r.x + r.w * 0.10, r.y + r.h * 0.46, r.w * 0.40, 24, 'rgba(255,190,120,__A__)', 0.08 * s, 8, -0.05);
    }
    if (gfx.reflectionSources.holo && layout.cube) {
      const c = layout.cube;
      drawReflectionBlob(rx, c.x + c.w * 0.48, c.y + c.h * 1.05, c.w * 2.1, c.h * 0.45, 'rgba(185,145,255,__A__)', 0.38 * gfx.holoReflectionStrength, 10, 0.02);
      drawReflectionStreak(rx, c.x + c.w * 0.55, c.y + c.h * 1.02, c.w * 1.7, 8, 'rgba(230,210,255,__A__)', 0.18 * gfx.holoReflectionStrength, 6, 0.0);
    }
    if (gfx.reflectionSources.tv && state.tvOn) {
      drawSurfaceSheen(rx, r.x + r.w * 0.48, r.y + r.h * 0.42, r.w * 0.30, 24, 'rgba(120,170,255,__A__)', 0.07 * gfx.tvReflectionStrength, 8, -0.03);
    }
    rx.restore();
  }

  function drawRackReflections() {
    const s = gfx.tableReflectionStrength;
    const h = layout.hifi; const d = layout.rackDisplay;
    rx.save(); rx.globalCompositeOperation = 'screen';
    if (gfx.reflectionSources.window || gfx.reflectionSources.city) {
      drawReflectionStreak(rx, h.x + h.w * 0.34, h.y + h.h * 0.56, h.w * 0.44, 20, 'rgba(120,170,255,__A__)', 0.08 * s, 8, -0.02);
    }
    if (gfx.reflectionSources.hifi && state.musicOn) {
      drawReflectionBlob(rx, d.x + d.w * 0.45, d.y + 22, d.w * 0.75, 22, 'rgba(100,220,255,__A__)', 0.10 * s, 8, 0.0);
    }
    rx.restore();
  }

  function renderReflectionPass() {
    clearReflectionCanvas();
    if (!gfx.reflections && !gfx.reflectionsPreview) return;
    drawFloorWindowReflection();
    drawFloorTvReflection();
    drawFloorLampReflection();
    drawTableReflections();
    drawRackReflections();
  }

  function compositeReflections() {
    if (!gfx.reflections) return;
    cx.save();
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'screen';
    cx.filter = 'blur(3px)';
    cx.drawImage(reflectionCanvas, 0, 0, reflectionCanvas.width, reflectionCanvas.height, 0, 0, RW, RH);
    cx.restore();
    cx.save();
    cx.globalAlpha = 0.12;
    cx.globalCompositeOperation = 'lighter';
    cx.filter = 'none';
    cx.drawImage(reflectionCanvas, 0, 0, reflectionCanvas.width, reflectionCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  return { renderReflectionPass, compositeReflections };
}
