export function createDepthPolishPass(deps) {
  const {
    gfx,
    layout,
    RW,
    RH,
    dx,
    depthCanvas,
    cx,
    configurePassCanvas,
    resetPassContext,
    timeProfile
  } = deps;

  function clearDepthCanvas() {
    configurePassCanvas(depthCanvas);
    dx.setTransform(1, 0, 0, 1, 0, 0);
    dx.clearRect(0, 0, depthCanvas.width, depthCanvas.height);
    resetPassContext(dx);
  }

  function drawDepthBackgroundSoftness() {
    if (gfx.backgroundSoftness <= 0) return;
    const tp = timeProfile();
    const nightD = 0.75 + tp.night * 0.35 + tp.sunset * 0.15;
    const s = gfx.depthStrength * gfx.backgroundSoftness * nightD;
    dx.save();
    dx.globalCompositeOperation = 'screen';
    const w = layout.win;
    const g = dx.createRadialGradient(
      w.x + w.w * 0.52, w.y + w.h * 0.55, w.w * 0.15,
      w.x + w.w * 0.52, w.y + w.h * 0.55, w.w * 0.95
    );
    g.addColorStop(0.00, `rgba(130,105,190,${(0.042 * s).toFixed(3)})`);
    g.addColorStop(0.45, `rgba(90,70,145,${(0.030 * s).toFixed(3)})`);
    g.addColorStop(1.00, 'rgba(90,70,145,0)');
    dx.fillStyle = g;
    dx.fillRect(w.x - w.w * 0.45, w.y - 140, w.w * 1.9, w.h * 1.9);
    const veil = dx.createLinearGradient(0, RH * 0.12, 0, RH * 0.68);
    veil.addColorStop(0.00, 'rgba(255,255,255,0)');
    veil.addColorStop(0.45, `rgba(105,85,160,${(0.022 * s).toFixed(3)})`);
    veil.addColorStop(1.00, 'rgba(255,255,255,0)');
    dx.fillStyle = veil;
    dx.fillRect(0, RH * 0.10, RW, RH * 0.58);
    dx.restore();
  }

  function drawDepthForegroundSoftness() {
    if (gfx.foregroundSoftness <= 0) return;
    const s = gfx.depthStrength * gfx.foregroundSoftness;
    dx.save();
    dx.globalCompositeOperation = 'multiply';
    const bottom = dx.createLinearGradient(0, RH * 0.75, 0, RH);
    bottom.addColorStop(0.00, 'rgba(0,0,0,0)');
    bottom.addColorStop(0.55, `rgba(18,8,34,${(0.028 * s).toFixed(3)})`);
    bottom.addColorStop(1.00, `rgba(8,3,18,${(0.12 * s).toFixed(3)})`);
    dx.fillStyle = bottom;
    dx.fillRect(0, RH * 0.73, RW, RH * 0.27);
    const left = dx.createLinearGradient(0, 0, RW * 0.26, 0);
    left.addColorStop(0.00, `rgba(10,4,22,${(0.08 * s).toFixed(3)})`);
    left.addColorStop(1.00, 'rgba(10,4,22,0)');
    dx.fillStyle = left;
    dx.fillRect(0, RH * 0.60, RW * 0.30, RH * 0.40);
    const right = dx.createLinearGradient(RW, 0, RW * 0.74, 0);
    right.addColorStop(0.00, `rgba(10,4,22,${(0.08 * s).toFixed(3)})`);
    right.addColorStop(1.00, 'rgba(10,4,22,0)');
    dx.fillStyle = right;
    dx.fillRect(RW * 0.70, RH * 0.60, RW * 0.30, RH * 0.40);
    dx.restore();
  }

  function drawDepthMidgroundClarity() {
    if (gfx.midgroundClarity <= 0) return;
    const s = gfx.depthStrength * gfx.midgroundClarity;
    dx.save();
    dx.globalCompositeOperation = 'screen';
    const g = dx.createRadialGradient(
      RW * 0.50, RH * 0.62, RW * 0.12,
      RW * 0.50, RH * 0.62, RW * 0.48
    );
    g.addColorStop(0.00, `rgba(255,240,220,${(0.032 * s).toFixed(3)})`);
    g.addColorStop(0.42, `rgba(190,175,255,${(0.018 * s).toFixed(3)})`);
    g.addColorStop(1.00, 'rgba(255,255,255,0)');
    dx.fillStyle = g;
    dx.fillRect(0, 0, RW, RH);
    dx.restore();
  }

  function drawDepthVignette() {
    if (gfx.depthVignetteStrength <= 0) return;
    const tp = timeProfile();
    const nightD = 0.75 + tp.night * 0.35 + tp.sunset * 0.15;
    const s = gfx.depthStrength * gfx.depthVignetteStrength * nightD;
    dx.save();
    dx.globalCompositeOperation = 'multiply';
    const g = dx.createRadialGradient(
      RW * 0.50, RH * 0.56, Math.min(RW, RH) * 0.28,
      RW * 0.50, RH * 0.56, Math.max(RW, RH) * 0.78
    );
    g.addColorStop(0.00, 'rgba(0,0,0,0)');
    g.addColorStop(0.65, `rgba(0,0,0,${(0.042 * s).toFixed(3)})`);
    g.addColorStop(1.00, `rgba(0,0,0,${(0.14 * s).toFixed(3)})`);
    dx.fillStyle = g;
    dx.fillRect(0, 0, RW, RH);
    dx.restore();
  }

  function renderDepthPolishPass() {
    clearDepthCanvas();
    if (!gfx.depthPolish && !gfx.depthPreview) return;
    drawDepthBackgroundSoftness();
    drawDepthForegroundSoftness();
    drawDepthMidgroundClarity();
    drawDepthVignette();
  }

  function compositeDepthPolish() {
    if (!gfx.depthPolish) return;
    cx.save();
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'source-over';
    cx.filter = 'none';
    cx.drawImage(depthCanvas, 0, 0, depthCanvas.width, depthCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  return { renderDepthPolishPass, compositeDepthPolish };
}
