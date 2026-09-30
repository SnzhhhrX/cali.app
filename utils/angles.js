// Угол в точке B между лучами BA и BC, в градусах (0..180).
export function angle(a, b, c) {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  const deg = Math.abs((rad * 180) / Math.PI);
  return deg > 180 ? 360 - deg : deg;
}
