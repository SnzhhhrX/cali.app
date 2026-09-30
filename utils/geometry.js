export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Плавное сглаживание значения (убирает дрожание)
export function smooth(prev, next, k) {
  return prev == null ? next : prev + (next - prev) * k;
}

// Отклонение точки B от прямой A→C по вертикали. >0 — B выше линии, <0 — ниже.
export function heightAboveLine(a, b, c) {
  const t = (b.x - a.x) / ((c.x - a.x) || 1e-6);
  const lineY = a.y + (c.y - a.y) * t;
  return lineY - b.y;
}

// Тело лежит горизонтально (для отжиманий и планки)?
export function isHorizontal(shoulder, ankle, maxSlope) {
  return Math.abs(shoulder.y - ankle.y) < Math.abs(shoulder.x - ankle.x) * maxSlope;
}
