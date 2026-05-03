export function createAtmospherePass(deps) {
  const {
    gfx,
    layout,
    RW,
    RH,
    ax,
    airCanvas,
    cx,
    scaledPx,
    configurePassCanvas,
    resetPassContext,
    microEnabled,
    micro
  } = deps;

  function clearAtmosphereCanvas() {
    configurePassCanvas(airCanvas);
    ax.setTransform(1, 0, 0, 1, 0, 0);
    ax.clearRect(0, 0, airCanvas.width, airCanvas.height);
    resetPassContext(ax);
  }

  function drawSoftAtmosphereBlob(ctx, x, y, r, innerRGBA, outerRGBA = 'rgba(0,0,0,0)') {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, innerRGBA);
    g.addColorStop(1, outerRGBA);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function drawAtmosphereBackFog() {
    if (gfx.backFogStrength <= 0) return;
    ax.save();
    ax.globalCompositeOperation = 'screen';
    const g = ax.createLinearGradient(0, RH * 0.18, 0, RH * 0.72);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.35, `rgba(70,55,110,${0.028 * gfx.backFogStrength})`);
    g.addColorStop(0.75, `rgba(95,70,145,${0.060 * gfx.backFogStrength})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ax.fillStyle = g;
    ax.fillRect(0, RH * 0.16, RW, RH * 0.60);
    const w = layout.win;
    const glow = ax.createRadialGradient(
      w.x + w.w * 0.5, w.y + w.h * 0.72, 20,
      w.x + w.w * 0.5, w.y + w.h * 0.72, w.w * 0.65
    );
    glow.addColorStop(0, `rgba(110,85,165,${0.068 * gfx.backFogStrength})`);
    glow.addColorStop(0.5, `rgba(90,70,145,${0.040 * gfx.backFogStrength})`);
    glow.addColorStop(1, 'rgba(90,70,145,0)');
    ax.fillStyle = glow;
    ax.fillRect(w.x - w.w * 0.25, w.y + w.h * 0.30, w.w * 1.5, w.h * 1.2);
    const skyDepth = ax.createRadialGradient(
      w.x + w.w * 0.50, w.y + w.h * 0.40, w.w * 0.15,
      w.x + w.w * 0.50, w.y + w.h * 0.40, w.w * 1.05
    );
    skyDepth.addColorStop(0,    `rgba(85,125,215,${0.042 * gfx.backFogStrength})`);
    skyDepth.addColorStop(0.45, `rgba(65,100,190,${0.018 * gfx.backFogStrength})`);
    skyDepth.addColorStop(1,    'rgba(65,100,190,0)');
    ax.fillStyle = skyDepth;
    ax.fillRect(w.x - w.w * 0.55, w.y - w.h * 0.25, w.w * 2.1, w.h * 1.7);
    ax.restore();
  }

  function drawAtmosphereMidDistance() {
    if (gfx.midHazeStrength <= 0) return;
    ax.save();
    ax.globalCompositeOperation = 'screen';
    const band = ax.createLinearGradient(0, RH * 0.42, 0, RH * 0.86);
    band.addColorStop(0, 'rgba(255,255,255,0)');
    band.addColorStop(0.28, `rgba(75,58,118,${0.038 * gfx.midHazeStrength})`);
    band.addColorStop(0.62, `rgba(110,82,160,${0.075 * gfx.midHazeStrength})`);
    band.addColorStop(1, 'rgba(255,255,255,0)');
    ax.fillStyle = band;
    ax.fillRect(0, RH * 0.40, RW, RH * 0.50);
    const dx = microEnabled() ? micro.hazeDriftX : 0;
    const dy = microEnabled() ? micro.hazeDriftY : 0;
    drawSoftAtmosphereBlob(
      ax, RW * 0.53 + dx, RH * 0.67 + dy, RW * 0.32,
      `rgba(110,80,155,${0.075 * gfx.midHazeStrength})`
    );
    ax.restore();
  }

  function drawAtmosphereFloorHaze() {
    if (gfx.floorHazeStrength <= 0) return;
    ax.save();
    ax.globalCompositeOperation = 'screen';
    const g = ax.createLinearGradient(0, RH * 0.60, 0, RH);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.36, `rgba(75,58,115,${0.030 * gfx.floorHazeStrength})`);
    g.addColorStop(0.72, `rgba(110,82,150,${0.062 * gfx.floorHazeStrength})`);
    g.addColorStop(1, `rgba(130,98,170,${0.090 * gfx.floorHazeStrength})`);
    ax.fillStyle = g;
    ax.fillRect(0, RH * 0.58, RW, RH * 0.42);
    drawSoftAtmosphereBlob(
      ax, RW * 0.52, RH * 0.86, RW * 0.40,
      `rgba(120,92,165,${0.090 * gfx.floorHazeStrength})`
    );
    if (layout.table) {
      const t = layout.table;
      drawSoftAtmosphereBlob(
        ax, t.x + t.w * 0.50, t.y + t.h * 0.80, t.w * 0.50,
        `rgba(125,96,170,${0.068 * gfx.floorHazeStrength})`
      );
    }
    ax.restore();
  }

  function renderAtmospherePass() {
    clearAtmosphereCanvas();
    if (!gfx.atmosphere && !gfx.atmospherePreview) return;
    drawAtmosphereBackFog();
    drawAtmosphereMidDistance();
    drawAtmosphereFloorHaze();
  }

  function compositeAtmosphere() {
    if (!gfx.atmosphere) return;
    cx.save();
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'screen';
    cx.filter = gfx.transitioning ? 'none' : `blur(${scaledPx(8).toFixed(1)}px)`;
    cx.drawImage(airCanvas, 0, 0, airCanvas.width, airCanvas.height, 0, 0, RW, RH);
    cx.restore();
    cx.save();
    cx.globalAlpha = 0.12;
    cx.globalCompositeOperation = 'source-over';
    cx.filter = 'none';
    cx.drawImage(airCanvas, 0, 0, airCanvas.width, airCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  return { renderAtmospherePass, compositeAtmosphere };
}
