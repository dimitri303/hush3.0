export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function ease(t) {
  return t * t * (3 - 2 * t);
}

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function gaussian(value, peak, width) {
  const d = Math.min(Math.abs(value - peak), 24 - Math.abs(value - peak));
  return Math.exp(-(d * d) / (2 * width * width));
}

export function mixColor(parts) {
  let r = 0;
  let g = 0;
  let b = 0;
  let t = 0;
  parts.forEach(([pr, pg, pb, a]) => {
    r += pr * a;
    g += pg * a;
    b += pb * a;
    t += a;
  });
  t = Math.max(t, 0.0001);
  return `rgb(${Math.round(r / t)},${Math.round(g / t)},${Math.round(b / t)})`;
}
