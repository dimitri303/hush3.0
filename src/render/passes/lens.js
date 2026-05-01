export function createLensPass(deps) {
  const {
    gfx,
    state,
    RW,
    RH,
    lnx,
    lensCanvas,
    glowCanvas,
    grainTileCanvas,
    ngx,
    cx,
    scaledPx,
    configurePassCanvas,
    resetPassContext
  } = deps;

  let lastGrainUpdate = 0;

  function clearLensCanvas() {
    configurePassCanvas(lensCanvas);
    lnx.setTransform(1, 0, 0, 1, 0, 0);
    lnx.clearRect(0, 0, lensCanvas.width, lensCanvas.height);
    resetPassContext(lnx);
  }

  function regenerateGrainTile() {
    const img = ngx.createImageData(256, 256);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 118 + Math.random() * 38;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    ngx.putImageData(img, 0, 0);
  }

  function maybeUpdateGrain() {
    if (!gfx.grain) return;
    const now = performance.now();
    if (now - lastGrainUpdate > 83) {
      regenerateGrainTile();
      lastGrainUpdate = now;
    }
  }

  function drawLensGrain() {
    if (!gfx.grain || gfx.grainStrength <= 0) return;
    maybeUpdateGrain();
    lnx.save();
    lnx.globalCompositeOperation = 'overlay';
    lnx.globalAlpha = gfx.grainStrength;
    const pattern = lnx.createPattern(grainTileCanvas, 'repeat');
    if (pattern) {
      lnx.fillStyle = pattern;
      const ox = Math.floor((state.t * 17) % 256);
      const oy = Math.floor((state.t * 11) % 256);
      lnx.translate(-ox, -oy);
      lnx.fillRect(ox, oy, RW + 256, RH + 256);
    }
    lnx.restore();
  }

  function drawSimpleEdgeChroma() {
    if (!gfx.chromaticAberration || gfx.chromaStrength <= 0) return;
    const s = gfx.chromaStrength;
    lnx.save();
    lnx.globalCompositeOperation = 'screen';
    const left = lnx.createLinearGradient(0, 0, RW * 0.16, 0);
    left.addColorStop(0, `rgba(255,40,120,${(0.025 * s).toFixed(3)})`);
    left.addColorStop(1, 'rgba(255,40,120,0)');
    lnx.fillStyle = left;
    lnx.fillRect(0, 0, RW * 0.16, RH);
    const right = lnx.createLinearGradient(RW, 0, RW * 0.84, 0);
    right.addColorStop(0, `rgba(60,220,255,${(0.025 * s).toFixed(3)})`);
    right.addColorStop(1, 'rgba(60,220,255,0)');
    lnx.fillStyle = right;
    lnx.fillRect(RW * 0.84, 0, RW * 0.16, RH);
    lnx.restore();
  }

  function drawLensHalation() {
    if (!gfx.halation || gfx.halationStrength <= 0) return;
    if (typeof glowCanvas === 'undefined') return;
    lnx.save();
    lnx.globalCompositeOperation = 'screen';
    lnx.globalAlpha = gfx.halationStrength * 0.5;
    lnx.filter = `blur(${scaledPx(gfx.halationBlur).toFixed(1)}px)`;
    lnx.drawImage(glowCanvas, 0, 0, RW, RH);
    lnx.globalCompositeOperation = 'source-atop';
    lnx.filter = 'none';
    lnx.fillStyle = 'rgba(255,100,70,0.14)';
    lnx.fillRect(0, 0, RW, RH);
    lnx.restore();
  }

  function drawScanTexture() {
    if (!gfx.scanTexture || gfx.scanTextureStrength <= 0) return;
    lnx.save();
    lnx.globalCompositeOperation = 'overlay';
    lnx.globalAlpha = gfx.scanTextureStrength;
    for (let y = 0; y < RH; y += 3) {
      lnx.fillStyle = y % 6 === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.20)';
      lnx.fillRect(0, y, RW, 1);
    }
    lnx.restore();
  }

  function renderLensPass() {
    clearLensCanvas();
    if (!gfx.lensTreatment && !gfx.lensPreview) return;
    drawLensHalation();
    drawSimpleEdgeChroma();
    drawScanTexture();
    drawLensGrain();
  }

  function compositeLensTreatment() {
    if (!gfx.lensTreatment) return;
    cx.save();
    cx.globalCompositeOperation = 'source-over';
    cx.globalAlpha = 1;
    cx.filter = 'none';
    cx.drawImage(lensCanvas, 0, 0, lensCanvas.width, lensCanvas.height, 0, 0, RW, RH);
    cx.restore();
  }

  return { renderLensPass, compositeLensTreatment };
}
