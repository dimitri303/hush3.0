export function createLightWrapPass(deps) {
  const {
    gfx,
    layout,
    state,
    RW,
    RH,
    lx,
    lightCanvas,
    cx,
    configurePassCanvas,
    resetPassContext,
    microEnabled,
    micro
  } = deps;

  const WRAP_SCALE = 0.5;

  function clearLightCanvas() {
    configurePassCanvas(lightCanvas);
    lx.setTransform(1, 0, 0, 1, 0, 0);
    lx.clearRect(0, 0, lightCanvas.width, lightCanvas.height);
    resetPassContext(lx);
  }

  function drawLightBlob(ctx, x, y, w, h, color, alpha = 0.18, blur = 18, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = color.replace('__A__', (alpha * WRAP_SCALE).toFixed(3));
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawLightStrip(ctx, x, y, w, h, color, alpha = 0.18, blur = 12) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, color.replace('__A__', (alpha * WRAP_SCALE).toFixed(3)));
    g.addColorStop(1, color.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function drawVerticalLightStrip(ctx, x, y, w, h, color, alpha = 0.18, blur = 12) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, color.replace('__A__', (alpha * WRAP_SCALE).toFixed(3)));
    g.addColorStop(1, color.replace('__A__', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function drawWrapWindowLight() {
    if (gfx.wrapWindowStrength <= 0) return;
    lx.save();
    lx.globalCompositeOperation = 'screen';
    const w = layout.win;
    drawLightBlob(lx, w.x + w.w * 0.62, w.y + w.h * 0.92, 760, 220, 'rgba(175,105,255,__A__)', 0.15 * gfx.wrapWindowStrength, 34, -0.05);
    drawLightBlob(lx, 1335, 620, 420, 180, 'rgba(175,105,255,__A__)', 0.18 * gfx.wrapWindowStrength, 26, -0.12);
    drawLightBlob(lx, 940, 660, 520, 120, 'rgba(120,170,255,__A__)', 0.12 * gfx.wrapAmbientStrength, 24, -0.02);
    drawLightBlob(lx, w.x + w.w * 0.52, RH * 0.80, 460, 110, 'rgba(145,190,255,__A__)', 0.08 * gfx.wrapWindowStrength, 28, -0.03);
    lx.restore();
  }

  function drawWrapLampLight() {
    if (gfx.wrapLampStrength <= 0 || !state.lampOn) return;
    lx.save();
    lx.globalCompositeOperation = 'screen';
    const p = layout.lampTarget || { x: 582, y: 715 };
    const lampMul = microEnabled() ? micro.lampWarmth : 1;
    drawLightBlob(lx, p.x, p.y, 260, 120, 'rgba(255,185,110,__A__)', 0.20 * gfx.wrapLampStrength * lampMul, 24, -0.22);
    drawLightBlob(lx, 720, 745, 330, 120, 'rgba(255,175,95,__A__)', 0.12 * gfx.wrapLampStrength * lampMul, 22, -0.10);
    lx.restore();
  }

  function drawWrapTvLight() {
    if (gfx.wrapTvStrength <= 0 || !state.tvOn) return;
    lx.save();
    lx.globalCompositeOperation = 'screen';
    const s = layout.screen;
    const ox = s.x + s.w * 0.5;
    const oy = s.y + s.h * 0.58;
    const tvMul = microEnabled() ? micro.tvPulse : 1;
    drawLightBlob(lx, ox, oy + 58, 250, 130, 'rgba(120,165,255,__A__)', 0.16 * gfx.wrapTvStrength * tvMul, 20, 0.0);
    drawLightBlob(lx, ox - 20, oy + 120, 300, 150, 'rgba(110,150,255,__A__)', 0.10 * gfx.wrapTvStrength * tvMul, 22, -0.05);
    lx.restore();
  }

  function drawWrapObjectAccents() {
    lx.save();
    lx.globalCompositeOperation = 'screen';
    const wrap = gfx.wraps;

    if (wrap.chair) {
      drawLightStrip(lx, 255, 600, 110, 210, 'rgba(165,105,255,__A__)', 0.11 * gfx.wrapWindowStrength, 16);
      drawLightBlob(lx, 420, 660, 150, 90, 'rgba(255,180,110,__A__)', 0.06 * gfx.wrapLampStrength, 14, -0.20);
    }
    if (wrap.lamp) {
      drawLightStrip(lx, 470, 500, 55, 170, 'rgba(255,190,120,__A__)', 0.10 * gfx.wrapLampStrength, 12);
      drawLightStrip(lx, 515, 500, 40, 160, 'rgba(170,110,255,__A__)', 0.05 * gfx.wrapWindowStrength, 14);
    }
    if (wrap.hifi) {
      drawLightBlob(lx, 890, 645, 420, 64, 'rgba(120,165,255,__A__)', 0.09 * gfx.wrapAmbientStrength, 14, 0);
      drawLightStrip(lx, 630, 618, 310, 24, 'rgba(165,110,255,__A__)', 0.08 * gfx.wrapWindowStrength, 10);
    }
    if (wrap.turntable && layout.recordPlayer) {
      const r = layout.recordPlayer;
      drawLightStrip(lx, r.x + r.w * 0.08, r.y + r.h * 0.15, r.w * 0.70, 18, 'rgba(120,170,255,__A__)', 0.08 * gfx.wrapAmbientStrength, 10);
      drawLightBlob(lx, r.x + r.w * 0.68, r.y + r.h * 0.40, r.w * 0.36, r.h * 0.28, 'rgba(175,110,255,__A__)', 0.06 * gfx.wrapWindowStrength, 10, 0);
    }
    if (wrap.tv && layout.tv) {
      const r = layout.tv;
      drawVerticalLightStrip(lx, r.x + r.w * 0.02, r.y + r.h * 0.12, 18, r.h * 0.68, 'rgba(175,110,255,__A__)', 0.11 * gfx.wrapWindowStrength, 10);
      drawLightStrip(lx, r.x + r.w * 0.16, r.y + r.h * 0.08, r.w * 0.52, 16, 'rgba(120,165,255,__A__)', 0.08 * gfx.wrapTvStrength, 10);
    }
    if (wrap.books && layout.books) {
      const r = layout.books;
      drawLightStrip(lx, r.x + r.w * 0.05, r.y + r.h * 0.08, r.w * 0.70, 20, 'rgba(175,110,255,__A__)', 0.08 * gfx.wrapWindowStrength, 10);
    }
    if (wrap.mug && layout.mug) {
      const r = layout.mug;
      drawLightBlob(lx, r.x + r.w * 0.35, r.y + r.h * 0.34, r.w * 0.26, r.h * 0.20, 'rgba(255,200,135,__A__)', 0.08 * gfx.wrapLampStrength, 9, 0);
      drawLightBlob(lx, r.x + r.w * 0.58, r.y + r.h * 0.30, r.w * 0.24, r.h * 0.18, 'rgba(170,110,255,__A__)', 0.05 * gfx.wrapWindowStrength, 9, 0);
    }
    if (wrap.table && layout.table) {
      const r = layout.table;
      drawLightStrip(lx, r.x + r.w * 0.18, r.y + r.h * 0.42, r.w * 0.54, 18, 'rgba(120,165,255,__A__)', 0.05 * gfx.wrapAmbientStrength, 10);
      drawLightStrip(lx, r.x + r.w * 0.58, r.y + r.h * 0.54, r.w * 0.26, 20, 'rgba(175,110,255,__A__)', 0.07 * gfx.wrapWindowStrength, 12);
    }
    if (wrap.holo && layout.cube) {
      const r = layout.cube;
      drawLightBlob(lx, r.x + r.w * 0.50, r.y + r.h * 0.48, r.w * 1.2, r.h * 0.80, 'rgba(180,145,255,__A__)', 0.10 * gfx.wrapWindowStrength, 10, 0);
    }
    if (wrap.clock && layout.clock) {
      const r = layout.clock;
      drawLightBlob(lx, r.x + r.w * 0.42, r.y + r.h * 0.22, r.w * 0.88, r.h * 0.60, 'rgba(145,175,255,__A__)', 0.07 * gfx.wrapAmbientStrength, 10, 0);
    }
    if (wrap.plant && layout.plant) {
      const r = layout.plant;
      drawLightBlob(lx, r.x + r.w * 0.50, r.y + r.h * 0.28, r.w * 0.80, r.h * 0.50, 'rgba(115,155,210,__A__)', 0.06 * gfx.wrapAmbientStrength, 12, 0);
    }

    lx.restore();
  }

  function renderLightWrapPass() {
    clearLightCanvas();
    if (!gfx.lightWrap && !gfx.lightWrapPreview) return;
    drawWrapWindowLight();
    drawWrapLampLight();
    drawWrapTvLight();
    drawWrapObjectAccents();
  }

  function compositeLightWrap() {
    if (!gfx.lightWrap) return;
    cx.save();
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'screen';
    cx.filter = gfx.transitioning ? 'none' : 'blur(6px)';
    cx.drawImage(lightCanvas, 0, 0, lightCanvas.width, lightCanvas.height, 0, 0, RW, RH);
    cx.restore();
    cx.save();
    cx.globalAlpha = 0.14;
    cx.globalCompositeOperation = 'lighter';
    cx.filter = 'none';
    cx.drawImage(lightCanvas, 0, 0, lightCanvas.width, lightCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  return { renderLightWrapPass, compositeLightWrap };
}
