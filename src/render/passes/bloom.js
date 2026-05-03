export function createBloomPass(deps) {
  const {
    gfx,
    layout,
    state,
    RW,
    RH,
    gx,
    glowCanvas,
    cx,
    scaledPx,
    configurePassCanvas,
    resetPassContext,
    timeProfile,
    neonAnchors
  } = deps;

  function clearBloomCanvas() {
    configurePassCanvas(glowCanvas);
    gx.setTransform(1, 0, 0, 1, 0, 0);
    gx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
    resetPassContext(gx);
  }

  function compositeBloom() {
    if (!gfx.bloom) return;
    cx.save();
    cx.globalCompositeOperation = 'screen';
    cx.globalAlpha = Math.max(0, gfx.bloomStrength);
    cx.filter = gfx.transitioning ? 'none' : `blur(${scaledPx(gfx.bloomBlur).toFixed(1)}px)`;
    cx.drawImage(glowCanvas, 0, 0, glowCanvas.width, glowCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  function drawBloomWindow() {
    if (!gfx.sources.window) return;
    const w = layout.win;
    const tp = timeProfile();
    const nightish = tp.night + tp.sunset * 0.6;
    gx.save();
    gx.globalCompositeOperation = 'lighter';
    const r = gx.createRadialGradient(
      w.x + w.w * 0.5, w.y + w.h * 0.85, 0,
      w.x + w.w * 0.5, w.y + w.h * 0.85, w.w * 0.7
    );
    r.addColorStop(0, `rgba(140,95,255,${0.10 * nightish})`);
    r.addColorStop(1, 'rgba(140,95,255,0)');
    gx.fillStyle = r;
    gx.fillRect(w.x - w.w * 0.25, w.y + w.h * 0.4, w.w * 1.5, w.h);
    gx.restore();
  }

  function drawBloomTV() {
    if (!gfx.sources.tv || !state.tvOn) return;
    const s = layout.screen;
    const isCoolWorld = state.theme === 'cool-world';
    const glowRgb = isCoolWorld ? '200,70,255' : '120,170,255';
    gx.save();
    gx.globalCompositeOperation = 'lighter';
    const glow = gx.createRadialGradient(
      s.x + s.w * 0.5, s.y + s.h * 0.6, 5,
      s.x + s.w * 0.5, s.y + s.h * 0.6, s.w * 1.6
    );
    glow.addColorStop(0, `rgba(${glowRgb},0.22)`);
    glow.addColorStop(1, `rgba(${glowRgb},0)`);
    gx.fillStyle = glow;
    gx.fillRect(s.x - s.w, s.y - s.h, s.w * 3, s.h * 3);
    gx.restore();
  }

  function drawBloomHolo() {
    if (!gfx.sources.holo) return;
    const c = layout.cubeGlow || { x: 1320, y: 903 };
    const isCoolWorld = state.theme === 'cool-world';
    gx.save();
    gx.globalCompositeOperation = 'lighter';
    const pulse = 0.65 + Math.sin(state.t * 2.2) * 0.35;
    const glowR = isCoolWorld ? 92 : 56;
    const r = gx.createRadialGradient(c.x, c.y, 0, c.x, c.y, glowR);
    if (isCoolWorld) {
      r.addColorStop(0,    `rgba(0,240,255,${0.32 * pulse})`);
      r.addColorStop(0.42, `rgba(180,0,255,${0.20 * pulse})`);
    } else {
      r.addColorStop(0, `rgba(180,140,255,${0.18 * pulse})`);
    }
    r.addColorStop(1, 'rgba(180,140,255,0)');
    gx.fillStyle = r;
    const fillR = isCoolWorld ? 104 : 64;
    gx.fillRect(c.x - fillR, c.y - fillR, fillR * 2, fillR * 2);
    gx.restore();
  }

  function drawBloomHifi() {
    if (!gfx.sources.hifi) return;
    const p = layout.hifiGlowOrigin || { x: 811, y: 689 };
    gx.save();
    gx.globalCompositeOperation = 'lighter';
    const r = gx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 120);
    r.addColorStop(0, 'rgba(120,170,255,0.15)');
    r.addColorStop(1, 'rgba(120,170,255,0)');
    gx.fillStyle = r;
    gx.fillRect(p.x - 130, p.y - 80, 260, 180);
    gx.restore();
  }

  function drawBloomCity() {
    if (!gfx.sources.city) return;
    const { x, y, w, h } = layout.win;
    const tp = timeProfile();
    const intensity = 0.10 + tp.sunset * 0.15 + tp.night * 0.35;
    gx.save();
    gx.beginPath(); gx.rect(x, y, w, h); gx.clip();
    gx.globalCompositeOperation = 'lighter';
    const horizonY = y + h * 0.72;
    const horizon = gx.createRadialGradient(x + w * 0.5, horizonY, 10, x + w * 0.5, horizonY, w * 0.65);
    horizon.addColorStop(0, `rgba(210,40,255,${0.18 * intensity})`);
    horizon.addColorStop(0.4, `rgba(80,180,255,${0.10 * intensity})`);
    horizon.addColorStop(1, 'rgba(80,180,255,0)');
    gx.fillStyle = horizon;
    gx.fillRect(x, y, w, h);
    if (Array.isArray(neonAnchors)) {
      neonAnchors.forEach((n) => {
        const nx = x + n.x * w;
        const ny1 = y + n.yt * h;
        const ny2 = y + n.yb * h;
        gx.fillStyle = `rgba(${n.r},${n.g},${n.b},${intensity * 0.55})`;
        gx.fillRect(nx - 2, ny1, 4, ny2 - ny1);
      });
    }
    gx.restore();
  }

  function renderBloomPass() {
    clearBloomCanvas();
    if (!gfx.bloom && !gfx.bloomPreview) return;
    drawBloomCity();
    drawBloomWindow();
    drawBloomTV();
    drawBloomHolo();
    drawBloomHifi();
  }

  return { renderBloomPass, compositeBloom };
}
