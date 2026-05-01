export function createMaterialPass(deps) {
  const {
    gfx,
    layout,
    RW,
    RH,
    mx,
    materialCanvas,
    cx,
    configurePassCanvas,
    resetPassContext,
    microEnabled,
    micro
  } = deps;

  const MAT_SCALE = 0.45;

  function clearMaterialCanvas() {
    configurePassCanvas(materialCanvas);
    mx.setTransform(1, 0, 0, 1, 0, 0);
    mx.clearRect(0, 0, materialCanvas.width, materialCanvas.height);
    resetPassContext(mx);
  }

  function drawMaterialSheen(ctx, x, y, w, h, angle, colour, alpha = 0.15, blur = 8) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle);
    ctx.filter = `blur(${blur}px)`;
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    const a = alpha * MAT_SCALE;
    g.addColorStop(0, colour.replace('__A__', '0'));
    g.addColorStop(0.45, colour.replace('__A__', (a * 0.35).toFixed(3)));
    g.addColorStop(0.5, colour.replace('__A__', a.toFixed(3)));
    g.addColorStop(0.55, colour.replace('__A__', (a * 0.35).toFixed(3)));
    g.addColorStop(1, colour.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function drawEdgeHighlight(ctx, x, y, w, h, colour, alpha = 0.12, blur = 5, vertical = false) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    const g = vertical ? ctx.createLinearGradient(x, y, x + w, y) : ctx.createLinearGradient(x, y, x, y + h);
    const a = (alpha * MAT_SCALE).toFixed(3);
    g.addColorStop(0, colour.replace('__A__', a));
    g.addColorStop(1, colour.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function drawSpecDot(ctx, x, y, r, colour, alpha = 0.35, blur = 3) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const a = alpha * MAT_SCALE;
    g.addColorStop(0, colour.replace('__A__', a.toFixed(3)));
    g.addColorStop(0.45, colour.replace('__A__', (a * 0.30).toFixed(3)));
    g.addColorStop(1, colour.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function drawGlassReflection(ctx, x, y, w, h, alpha = 0.18) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const a = alpha * MAT_SCALE;
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.18, `rgba(190,220,255,${(a * 0.35).toFixed(3)})`);
    g.addColorStop(0.32, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = a * 0.55;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * 0.18);
    ctx.lineTo(x + w * 0.48, y + h * 0.05);
    ctx.stroke();
    ctx.restore();
  }

  function drawMaterialTable() {
    if (!gfx.materials.table) return;
    const r = layout.table; const s = gfx.materialStrength;
    const mm = microEnabled() ? micro.materialShimmer : 1;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawMaterialSheen(mx, r.x + r.w * 0.12, r.y + r.h * 0.38, r.w * 0.70, r.h * 0.10, -0.05, 'rgba(255,205,145,__A__)', 0.12 * gfx.woodSheenStrength * s * mm, 10);
    drawEdgeHighlight(mx, r.x + r.w * 0.16, r.y + r.h * 0.55, r.w * 0.68, 18, 'rgba(255,195,125,__A__)', 0.11 * gfx.woodSheenStrength * s, 7, false);
    drawMaterialSheen(mx, r.x + r.w * 0.44, r.y + r.h * 0.43, r.w * 0.36, r.h * 0.055, -0.03, 'rgba(150,175,255,__A__)', 0.08 * gfx.glassSheenStrength * s * mm, 9);
    mx.restore();
  }

  function drawMaterialChair() {
    if (!gfx.materials.chair) return;
    const s = gfx.materialStrength;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawMaterialSheen(mx, 250, 610, 210, 45, -0.28, 'rgba(255,205,145,__A__)', 0.07 * gfx.leatherSheenStrength * s, 9);
    drawMaterialSheen(mx, 335, 690, 260, 44, -0.18, 'rgba(180,135,255,__A__)', 0.06 * gfx.leatherSheenStrength * s, 10);
    drawMaterialSheen(mx, 430, 790, 220, 38, -0.10, 'rgba(255,185,120,__A__)', 0.05 * gfx.leatherSheenStrength * s, 9);
    mx.restore();
  }

  function drawMaterialTV() {
    if (!gfx.materials.tv) return;
    const r = layout.tv; const s = layout.screen; const str = gfx.materialStrength;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawGlassReflection(mx, s.x, s.y, s.w, s.h, 0.16 * gfx.glassSheenStrength * str);
    drawMaterialSheen(mx, r.x + r.w * 0.18, r.y + r.h * 0.14, r.w * 0.58, r.h * 0.08, -0.05, 'rgba(170,190,255,__A__)', 0.11 * gfx.glassSheenStrength * str, 8);
    drawSpecDot(mx, r.x + r.w * 0.75, r.y + r.h * 0.23, 22, 'rgba(210,220,255,__A__)', 0.14 * gfx.glassSheenStrength * str, 4);
    mx.restore();
  }

  function drawMaterialHifi() {
    if (!gfx.materials.hifi) return;
    const r = layout.hifi; const d = layout.rackDisplay; const str = gfx.materialStrength;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawMaterialSheen(mx, r.x + r.w * 0.12, r.y + r.h * 0.57, r.w * 0.62, 34, -0.02, 'rgba(145,175,255,__A__)', 0.09 * gfx.metalGlintStrength * str, 8);
    drawGlassReflection(mx, d.x, d.y - 3, d.w, Math.max(20, d.h + 12), 0.12 * gfx.glassSheenStrength * str);
    const k = layout.rackKnobs || { x: 913, y: 705 };
    drawSpecDot(mx, k.x, k.y, 14, 'rgba(230,235,255,__A__)', 0.15 * gfx.metalGlintStrength * str, 4);
    drawSpecDot(mx, k.x + 42, k.y + 2, 11, 'rgba(230,235,255,__A__)', 0.11 * gfx.metalGlintStrength * str, 4);
    mx.restore();
  }

  function drawMaterialTurntable() {
    if (!gfx.materials.turntable) return;
    const r = layout.recordPlayer; const str = gfx.materialStrength;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawMaterialSheen(mx, r.x + r.w * 0.10, r.y + r.h * 0.12, r.w * 0.80, r.h * 0.25, -0.06, 'rgba(180,205,255,__A__)', 0.12 * gfx.glassSheenStrength * str, 8);
    drawSpecDot(mx, r.x + r.w * 0.36, r.y + r.h * 0.52, r.w * 0.22, 'rgba(210,220,255,__A__)', 0.10 * gfx.metalGlintStrength * str, 7);
    mx.restore();
  }

  function drawMaterialMug() {
    if (!gfx.materials.mug) return;
    const r = layout.mug; const str = gfx.materialStrength;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawSpecDot(mx, r.x + r.w * 0.42, r.y + r.h * 0.32, r.w * 0.16, 'rgba(255,235,210,__A__)', 0.22 * gfx.glassSheenStrength * str, 4);
    drawMaterialSheen(mx, r.x + r.w * 0.24, r.y + r.h * 0.20, r.w * 0.38, r.h * 0.10, -0.08, 'rgba(255,235,210,__A__)', 0.11 * gfx.glassSheenStrength * str, 5);
    mx.restore();
  }

  function drawMaterialBooks() {
    if (!gfx.materials.books) return;
    const r = layout.books; const str = gfx.materialStrength;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawMaterialSheen(mx, r.x + r.w * 0.08, r.y + r.h * 0.16, r.w * 0.72, r.h * 0.10, -0.04, 'rgba(255,220,170,__A__)', 0.08 * gfx.woodSheenStrength * str, 5);
    drawEdgeHighlight(mx, r.x + r.w * 0.18, r.y + r.h * 0.42, r.w * 0.62, 10, 'rgba(190,165,255,__A__)', 0.06 * gfx.glassSheenStrength * str, 5, false);
    mx.restore();
  }

  function drawMaterialHolo() {
    if (!gfx.materials.holo) return;
    const r = layout.cube; const str = gfx.materialStrength;
    const cx0 = r.x + r.w * 0.5; const cy0 = r.y + r.h * 0.42;
    mx.save(); mx.globalCompositeOperation = 'screen';
    drawSpecDot(mx, cx0, cy0, r.w * 0.85, 'rgba(185,145,255,__A__)', 0.13 * str, 8);
    drawSpecDot(mx, cx0 + r.w * 0.10, cy0 - r.h * 0.08, r.w * 0.26, 'rgba(230,210,255,__A__)', 0.20 * str, 5);
    mx.restore();
  }

  function drawMaterialFloor() {
    if (!gfx.materials.floor) return;
    const str = gfx.materialStrength;
    mx.save(); mx.globalCompositeOperation = 'screen';
    const g = mx.createLinearGradient(0, RH * 0.72, 0, RH);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.55, `rgba(135,110,165,${(0.025 * str * MAT_SCALE).toFixed(3)})`);
    g.addColorStop(1, `rgba(160,130,190,${(0.038 * str * MAT_SCALE).toFixed(3)})`);
    mx.fillStyle = g;
    mx.fillRect(0, RH * 0.70, RW, RH * 0.30);
    mx.restore();
  }

  function renderMaterialPass() {
    clearMaterialCanvas();
    if (!gfx.materialResponse && !gfx.materialPreview) return;
    drawMaterialTable();
    drawMaterialChair();
    drawMaterialTV();
    drawMaterialHifi();
    drawMaterialTurntable();
    drawMaterialMug();
    drawMaterialBooks();
    drawMaterialHolo();
    drawMaterialFloor();
  }

  function compositeMaterialResponse() {
    if (!gfx.materialResponse) return;
    cx.save();
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'screen';
    cx.filter = 'none';
    cx.drawImage(materialCanvas, 0, 0, materialCanvas.width, materialCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  return { renderMaterialPass, compositeMaterialResponse };
}
