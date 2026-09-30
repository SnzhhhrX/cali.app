// Наша собственная логика: по координатам считаем углы, состояния и повторения.
import { angle } from '../utils/angles.js';
import { distance, smooth, heightAboveLine, isHorizontal } from '../utils/geometry.js';
import { T } from '../utils/thresholds.js';

// Индексы точек MediaPipe: [плечо, локоть, запястье, бедро, колено, лодыжка]
const SIDES = { left: [11, 13, 15, 23, 25, 27], right: [12, 14, 16, 24, 26, 28] };
const NEEDED = { squat: [0, 3, 4, 5], pushup: [0, 1, 2, 3, 5], plank: [0, 3, 4] };

// Берём сторону тела, которую камера видит лучше, и считаем уверенность
function pickSide(lm, exercise) {
  let best = null;
  for (const idx of Object.values(SIDES)) {
    const conf = Math.min(...NEEDED[exercise].map((k) => lm[idx[k]].visibility ?? 0));
    if (!best || conf > best.confidence) {
      const [shoulder, elbow, wrist, hip, knee, ankle] = idx.map((i) => lm[i]);
      best = { confidence: conf, shoulder, elbow, wrist, hip, knee, ankle };
    }
  }
  return best;
}

export function createExercise(name) {
  const isSquat = name === 'squat';
  const [idle, low] = isSquat ? ['STANDING', 'DOWN'] : ['UP', 'DOWN'];
  let state = idle, angleSmooth = null, minAngle = 999, lastRepAt = 0, reachedGoodDepth = false;

  function update(lm) {
    const p = pickSide(lm, name);
    const out = { confidence: p.confidence, state, repDone: false, inPosition: true, metrics: {} };
    if (p.confidence < T.MIN_CONFIDENCE) return out;

    if (name === 'plank') {
      out.inPosition = isHorizontal(p.shoulder, p.knee, T.HORIZONTAL_MAX_SLOPE);
      out.metrics = { bodyAngle: angle(p.shoulder, p.hip, p.knee), hipHeight: heightAboveLine(p.shoulder, p.hip, p.knee) };
      return out;
    }

    if (!isSquat && !isHorizontal(p.shoulder, p.ankle, T.HORIZONTAL_MAX_SLOPE)) { out.inPosition = false; return out; } // вне позиции повторы не считаем
    const raw = isSquat ? angle(p.hip, p.knee, p.ankle) : angle(p.shoulder, p.elbow, p.wrist);
    angleSmooth = smooth(angleSmooth, raw, T.SMOOTHING);
    const downAt = isSquat ? T.SQUAT_DOWN_ANGLE : T.PUSHUP_DOWN_ANGLE;
    const upAt = isSquat ? T.SQUAT_UP_ANGLE : T.PUSHUP_UP_ANGLE;

    if (state === idle && angleSmooth < downAt) { state = low; minAngle = angleSmooth; reachedGoodDepth = angleSmooth <= (isSquat ? T.SQUAT_GOOD_DEPTH : T.PUSHUP_GOOD_DEPTH); }
    else if (state === low) {
      minAngle = Math.min(minAngle, angleSmooth);
      if (angleSmooth <= (isSquat ? T.SQUAT_GOOD_DEPTH : T.PUSHUP_GOOD_DEPTH)) reachedGoodDepth = true;
      if (angleSmooth > upAt) {
        state = idle;
        const t = performance.now();
        if (t - lastRepAt > T.MIN_REP_MS && reachedGoodDepth) { out.repDone = true; lastRepAt = t; } // считаем только полный повтор с достаточной глубиной
        reachedGoodDepth = false;
      }
    }
    out.state = state;

    if (isSquat) {
      const ankleDist = distance(lm[27], lm[28]);
      out.metrics = {
        angle: angleSmooth, minAngle,
        torsoAngle: angle(p.shoulder, p.hip, p.knee),
        kneeRatio: ankleDist > 0.08 ? distance(lm[25], lm[26]) / ankleDist : 1, // 1 = не проверяем (вид сбоку)
      };
    } else {
      out.inPosition = isHorizontal(p.shoulder, p.ankle, T.HORIZONTAL_MAX_SLOPE);
      out.metrics = { angle: angleSmooth, minAngle, bodyAngle: angle(p.shoulder, p.hip, p.ankle), hipHeight: heightAboveLine(p.shoulder, p.hip, p.ankle) };
    }
    return out;
  }
  return { name, update };
}
