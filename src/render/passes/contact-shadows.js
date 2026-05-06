export function createContactShadowPass(deps) {
  const {
    gfx,
    layout,
    RW,
    RH,
    sx,
    shadowCanvas,
    cx,
    configurePassCanvas,
    resetPassContext
  } = deps;

  function clearShadowCanvas() {
    configurePassCanvas(shadowCanvas);
    sx.setTransform(1, 0, 0, 1, 0, 0);
    sx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    resetPassContext(sx);
  }

  function drawShadowEllipse(ctx, x, y, w, h, alpha = 0.25, blur = 12) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(1, w / 2), Math.max(1, h / 2), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawContactShadow(ctx, x, y, w, h, tightAlpha = 0.32, softAlpha = 0.16) {
    drawShadowEllipse(ctx, x, y, w * 1.25, h * 1.45, softAlpha * gfx.aoStrength, 18);
    drawShadowEllipse(ctx, x, y, w, h, tightAlpha * gfx.contactStrength, 7);
  }

  function drawAngledContactShadow(ctx, x, y, w, h, angle = 0, tightAlpha = 0.28, softAlpha = 0.13) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    drawShadowEllipse(ctx, 0, 0, w * 1.25, h * 1.45, softAlpha * gfx.aoStrength, 18);
    drawShadowEllipse(ctx, 0, 0, w, h, tightAlpha * gfx.contactStrength, 7);
    ctx.restore();
  }

  function renderContactShadowPass() {
    clearShadowCanvas();
    if (!gfx.contactShadows && !gfx.contactPreview) return;
    const sh = gfx.shadows;

    if (sh.chair && layout.chair) {
      const r = layout.chair;
      const chx = r.x + r.w * 0.50;
      const chy = r.y + r.h * 0.68;
      drawShadowEllipse(sx, chx, chy + 9, 520, 68, 0.08 * gfx.aoStrength, 36);
      drawAngledContactShadow(sx, chx, chy, 350, 82, -0.08, 0.34, 0.15);
      drawAngledContactShadow(sx, chx + 125, chy - 37, 220, 46, -0.04, 0.22, 0.10);
    }
    if (sh.lamp && layout.lamp) {
      const r = layout.lamp;
      const lampX = r.x + r.w * 0.50;
      const lampY = r.y + r.h * 0.97;
      drawContactShadow(sx, lampX, lampY,     r.w * 0.52, 30, 0.24, 0.09);
      drawContactShadow(sx, lampX, lampY + 6, r.w * 0.72, 34, 0.16, 0.07);
    }
    if (sh.hifi && layout.hifi) {
      const r = layout.hifi;
      drawShadowEllipse(sx, r.x + r.w * 0.50, r.y + r.h * 0.94, r.w * 0.88, 52, 0.07 * gfx.aoStrength, 36);
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.92, r.w * 0.71, 54, 0.00, 0.32, 0.14);
    }
    if (sh.turntable && layout.recordPlayer) {
      const r = layout.recordPlayer;
      drawAngledContactShadow(sx, r.x + r.w * 0.52, r.y + r.h * 0.86, r.w * 0.92, r.h * 0.23, 0.02, 0.30, 0.10);
    }
    // if (sh.headphones && layout.headphones) {  // disabled — keep for re-enable
    //   const r = layout.headphones;
    //   drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.82, r.w * 0.72, r.h * 0.24, 0.04, 0.28, 0.08);
    // }
    if (sh.leftSpeaker && layout.leftSpeaker) {
      const r = layout.leftSpeaker;
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.96, r.w * 0.72, r.h * 0.14, 0.00, 0.26, 0.09);
    }
    if (sh.rightSpeaker && layout.rightSpeaker) {
      const r = layout.rightSpeaker;
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.96, r.w * 0.72, r.h * 0.14, 0.00, 0.26, 0.09);
    }
    if (sh.tv && layout.tv) {
      const r = layout.tv;
      drawShadowEllipse(sx, r.x + r.w * 0.52, r.y + r.h + 58, r.w * 1.30, r.h * 0.26, 0.07 * gfx.aoStrength, 38);
      drawAngledContactShadow(sx, r.x + r.w * 0.52, r.y + r.h * 0.92, r.w * 0.88, r.h * 0.18, 0.02, 0.38, 0.16);
      drawAngledContactShadow(sx, r.x + r.w * 0.58, r.y + r.h + 42, r.w * 1.05, r.h * 0.25, 0.02, 0.18, 0.08);
    }
    if (sh.table && layout.table) {
      const r = layout.table;
      drawShadowEllipse(sx, r.x + r.w * 0.50, r.y + r.h * 0.90, r.w * 1.12, r.h * 0.26, 0.07 * gfx.aoStrength, 36);
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.82, r.w * 0.86, r.h * 0.18, 0.00, 0.30, 0.14);
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.98, r.w * 0.82, r.h * 0.08, 0.00, 0.22, 0.10);
    }
    if (sh.mug && layout.mug) {
      const r = layout.mug;
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.84, r.w * 0.42, r.h * 0.16, 0.04, 0.36, 0.11);
    }
    if (sh.remote && layout.remote) {
      const r = layout.remote;
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.62, r.w * 0.30, r.h * 0.70, -0.10, 0.30, 0.08);
    }
    if (sh.books && layout.books) {
      const r = layout.books;
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.76, r.w * 0.86, r.h * 0.30, -0.04, 0.32, 0.11);
    }
    if (sh.holo && layout.cube) {
      const r = layout.cube;
      // Broader soft AO pool beneath emitter base
      drawShadowEllipse(sx, r.x + r.w * 0.50, r.y + r.h * 0.94, r.w * 1.80, r.h * 0.22, 0.05 * gfx.aoStrength, 28);
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.92, r.w * 0.65, r.h * 0.18, 0.02, 0.30, 0.08);
    }
    if (sh.clock && layout.clock) {
      const r = layout.clock;
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.96, r.w * 0.88, r.h * 0.26, 0.01, 0.26, 0.09);
    }
    if (sh.plant && layout.plant) {
      const r = layout.plant;
      // Shadow under pot base only (bottom ~40% of asset is the pot)
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.97, r.w * 0.52, r.h * 0.14, 0.00, 0.28, 0.10);
    }
    if (sh.guestbook && layout.guestbook) {
      const r = layout.guestbook;
      drawAngledContactShadow(sx, r.x + r.w * 0.50, r.y + r.h * 0.90, r.w * 0.90, r.h * 0.18, 0.00, 0.26, 0.09);
    }
  }

  function compositeContactShadows() {
    if (!gfx.contactShadows) return;
    cx.save();
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'multiply';
    cx.filter = 'none';
    cx.drawImage(shadowCanvas, 0, 0, shadowCanvas.width, shadowCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  return { renderContactShadowPass, compositeContactShadows };
}
