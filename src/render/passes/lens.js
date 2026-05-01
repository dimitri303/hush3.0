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
  const grainImageData = ngx.createImageData(256, 256);
  let grainPattern = null;
  const scanTileCanvas = document.createElement('canvas');
  scanTileCanvas.width = 1;
  scanTileCanvas.height = 6;
  const stx = scanTileCanvas.getContext('2d');
  stx.fillStyle = 'rgba(255,255,255,0.18)';
  stx.fillRect(0, 0, 1, 1);
  stx.fillStyle = 'rgba(0,0,0,0.20)';
  stx.fillRect(0, 3, 1, 1);
  let scanPattern = null;

  function clearLensCanvas() {
    configurePassCanvas(lensCanvas);
    lnx.setTransform(1, 0, 0, 1, 0, 0);
    lnx.clearRect(0, 0, lensCanvas.width, lensCanvas.height);
    resetPassContext(lnx);
  }

  function regenerateGrainTile() {
    const d = grainImageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 118 + Math.random() * 38;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    ngx.putImageData(grainImageData, 0, 0);
  }

  function maybeUpdateGrain() {
    if (!gfx.grain) return;
    const now = performance.now();
    const interval = gfx.qualityMode === '720p' ? 140 : gfx.qualityMode === '900p' ? 105 : 83;
    if (now - lastGrainUpdate > interval) {
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
    grainPattern ||= lnx.createPattern(grainTileCanvas, 'repeat');
    if (grainPattern) {
      lnx.fillStyle = grainPattern;
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
    const qMul = gfx.qualityMode === '720p' ? 0.65 : gfx.qualityMode === '900p' ? 0.8 : 1;
    lnx.save();
    lnx.globalCompositeOperation = 'screen';
    lnx.globalAlpha = gfx.halationStrength * 0.5 * qMul;
    lnx.filter = `blur(${scaledPx(gfx.halationBlur * qMul).toFixed(1)}px)`;
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
    scanPattern ||= lnx.createPattern(scanTileCanvas, 'repeat');
    if (scanPattern) {
      lnx.fillStyle = scanPattern;
      lnx.fillRect(0, 0, RW, RH);
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
